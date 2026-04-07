#!/usr/bin/env python3
"""
Import Contrau Eco KR accounting data from Excel files into Supabase.
Processes 계정별원장 (account ledger) and inserts into misa_vouchers + misa_voucher_details.
"""

import xlrd
import re
import uuid
import json
import urllib.request
import urllib.error
from collections import defaultdict

# Config
SUPABASE_URL = "https://uyvghswdreirwhflvxhm.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dmdoc3dkcmVpcndoZmx2eGhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM4MDA3NCwiZXhwIjoyMDg5OTU2MDc0fQ.gTrqcmUc2MoA9hJNPGjQi7nHE7jCOcmHRnDSUgPAzco"
COMPANY_CODE = "CONTRAU_KR"
LEDGER_FILE = "/Users/luu/OneDrive/kakao talk/콘쩌우에코_계정별원장 (1) (1).xls"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}


def supabase_post(endpoint, data, prefer="return=minimal"):
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = dict(HEADERS)
    headers["Prefer"] = prefer
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def supabase_delete(endpoint, params):
    """DELETE rows matching params from endpoint."""
    query = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}?{query}"
    headers = dict(HEADERS)
    headers["Prefer"] = "return=minimal"
    req = urllib.request.Request(url, headers=headers, method="DELETE")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def upsert_company():
    """Ensure CONTRAU_KR exists in misa_companies."""
    print("Step 1: Ensuring CONTRAU_KR in misa_companies...")
    headers = dict(HEADERS)
    headers["Prefer"] = "resolution=merge-duplicates,return=minimal"
    data = {"company_code": COMPANY_CODE, "company_name": "Con Trau Eco, Inc. (Korea)"}
    body = json.dumps(data).encode("utf-8")
    url = f"{SUPABASE_URL}/rest/v1/misa_companies"
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"  OK: status {resp.status}")
    except urllib.error.HTTPError as e:
        body = e.read()
        print(f"  Response {e.code}: {body.decode()[:200]}")


def parse_account_code(header_cell):
    """Extract account code like '103' from '계정과목 : [103] 보통예금'."""
    m = re.search(r'\[(\d+)\]', header_cell)
    return m.group(1) if m else None


def parse_date(date_str, prev_date):
    """Convert 'MM-DD' to '2025-MM-DD'. If empty, use prev_date."""
    date_str = str(date_str).strip()
    if not date_str or date_str == '':
        return prev_date
    # Already might be in MM-DD format from xlrd
    m = re.match(r'^(\d{1,2})-(\d{2})$', date_str)
    if m:
        mm = m.group(1).zfill(2)
        dd = m.group(2)
        return f"2025-{mm}-{dd}"
    return prev_date


def parse_amount(val):
    """Parse numeric amount from xlrd cell value."""
    if val == '' or val is None:
        return 0.0
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0.0


def is_header_row(row):
    """Check if this is a section header row with account info."""
    return '계정과목' in str(row[6]) and '[' in str(row[6])


def is_page_header(row):
    """Check if this is a page title row (계정별원장)."""
    return '계정별원장' in str(row[3]) or '계정별원장' in str(row[0])


def is_column_header(row):
    """Check if this is the column header row (날짜, 적요란, etc.)."""
    return '날짜' in str(row[0]) or str(row[0]).strip() == '날짜'


def is_monthly_summary(row):
    """Check if this is a monthly/cumulative summary row."""
    desc = str(row[1])
    return '월         계' in desc or '누         계' in desc or \
           '월    계' in desc or '누    계' in desc or \
           '[ 월' in desc or '[ 누' in desc


def is_period_header(row):
    """Check if this is a date range header."""
    return '2025.' in str(row[3]) or '2025.01.01' in str(row[3])


def parse_ledger():
    """Parse the account ledger XLS file.

    Returns list of records:
    {account_code, date, description, code, counterparty, debit, credit}
    """
    print(f"\nStep 2: Parsing ledger file...")
    wb = xlrd.open_workbook(LEDGER_FILE)
    sh = wb.sheet_by_index(0)
    print(f"  File has {sh.nrows} rows, {sh.ncols} cols")

    records = []
    current_account = None
    prev_date = None
    skipped = 0
    section_count = 0

    for i in range(sh.nrows):
        row = [str(sh.cell_value(i, j)).strip() for j in range(sh.ncols)]

        # Skip completely empty rows
        if not any(x for x in row):
            continue

        # Detect account section header
        if is_header_row(row):
            acct = parse_account_code(row[6])
            if acct:
                current_account = acct
                section_count += 1
            continue

        # Skip page title rows, column headers, period headers, summary rows
        if is_page_header(row) or is_column_header(row) or \
           is_period_header(row) or is_monthly_summary(row):
            continue

        # Skip 전기이월 (opening balance carry-forward)
        if '전기이월' in row[1]:
            skipped += 1
            continue

        # No account set yet - skip
        if current_account is None:
            continue

        # Data row
        date_raw = row[0]
        description = row[1]
        code = row[2]
        counterparty = row[3]
        debit = parse_amount(row[4])
        credit = parse_amount(row[5])

        # Skip rows with no financial activity
        if debit == 0 and credit == 0:
            continue

        # Parse date
        full_date = parse_date(date_raw, prev_date)
        if full_date:
            prev_date = full_date
        else:
            full_date = prev_date or "2025-01-01"

        records.append({
            "account_code": current_account,
            "date": full_date,
            "description": description,
            "code": code,
            "counterparty": counterparty,
            "debit": debit,
            "credit": credit,
        })

    print(f"  Parsed {len(records)} data rows from {section_count} account sections")
    print(f"  Skipped {skipped} 전기이월 rows")
    return records


def build_vouchers(records):
    """Group records into vouchers and details.

    Voucher key = (date, description, counterparty)
    Each record becomes one voucher_detail.
    """
    # Group by (date, description, counterparty) → voucher
    voucher_map = {}  # key → refid

    vouchers = []
    details = []

    # Track seen voucher keys to assign refids
    for rec in records:
        key = (rec["date"], rec["description"], rec["counterparty"])

        if key not in voucher_map:
            refid = str(uuid.uuid4())
            voucher_map[key] = refid
            vouchers.append({
                "refid": refid,
                "company_code": COMPANY_CODE,
                "voucher_type": 0,
                "refno": rec["description"] or f"KR-{rec['date']}",
                "refdate": rec["date"],
                "total_amount": 0,  # will update below
                "description": rec["description"] or "",
                "misa_synced_at": "2025-12-31T00:00:00+00:00",
            })

        refid = voucher_map[key]
        amount = rec["debit"] if rec["debit"] > 0 else rec["credit"]

        # Determine debit/credit account based on sign
        # If debit > 0: this account is the debit side
        # If credit > 0: this account is the credit side
        if rec["debit"] > 0:
            debit_account = rec["account_code"]
            credit_account = None
        else:
            debit_account = None
            credit_account = rec["account_code"]

        details.append({
            "ref_detail_id": str(uuid.uuid4()),
            "company_code": COMPANY_CODE,
            "refid": refid,
            "sort_order": len(details),
            "debit_account": debit_account,
            "credit_account": credit_account,
            "amount": amount,
            "description": rec["description"] or "",
            "misa_synced_at": "2025-12-31T00:00:00+00:00",
        })

    # Update total_amount for each voucher (sum of detail amounts)
    voucher_totals = defaultdict(float)
    for d in details:
        voucher_totals[d["refid"]] += d["amount"]

    voucher_lookup = {v["refid"]: v for v in vouchers}
    for refid, total in voucher_totals.items():
        voucher_lookup[refid]["total_amount"] = total

    print(f"\n  Built {len(vouchers)} vouchers and {len(details)} detail rows")
    return vouchers, details


def batch_insert(endpoint, rows, batch_size=500):
    """Insert rows in batches. Returns (total_ok, total_err)."""
    total_ok = 0
    total_err = 0

    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        status, body = supabase_post(endpoint, batch)
        if status in (200, 201):
            total_ok += len(batch)
        else:
            total_err += len(batch)
            print(f"  ERROR batch {i//batch_size}: status {status}: {body.decode()[:300]}")
            # Try smaller batches on error
            if batch_size > 50:
                print(f"  Retrying with smaller batch...")
                for row in batch:
                    s2, b2 = supabase_post(endpoint, [row])
                    if s2 in (200, 201):
                        total_ok += 1
                        total_err -= 1
                    else:
                        print(f"    Row error: {b2.decode()[:200]}")

        if (i // batch_size) % 5 == 0:
            print(f"  Progress: {min(i + batch_size, len(rows))}/{len(rows)}")

    return total_ok, total_err


def delete_existing():
    """Delete existing CONTRAU_KR data before re-importing."""
    print("\nClearing existing CONTRAU_KR data...")

    # Delete details first (FK constraint)
    status, body = supabase_delete("misa_voucher_details", {"company_code": f"eq.{COMPANY_CODE}"})
    print(f"  Details delete: {status}")

    # Delete vouchers
    status, body = supabase_delete("misa_vouchers", {"company_code": f"eq.{COMPANY_CODE}"})
    print(f"  Vouchers delete: {status}")


def main():
    print("=" * 60)
    print("Contrau Eco KR Accounting Import")
    print("=" * 60)

    # Step 1: Ensure company exists
    upsert_company()

    # Step 2: Parse ledger
    records = parse_ledger()

    # Step 3: Build voucher structures
    vouchers, details = build_vouchers(records)

    # Step 4: Delete existing data
    delete_existing()

    # Step 5: Insert vouchers
    print(f"\nInserting {len(vouchers)} vouchers...")
    v_ok, v_err = batch_insert("misa_vouchers", vouchers, batch_size=500)
    print(f"  Vouchers: {v_ok} OK, {v_err} errors")

    # Step 6: Insert details
    print(f"\nInserting {len(details)} voucher details...")
    d_ok, d_err = batch_insert("misa_voucher_details", details, batch_size=500)
    print(f"  Details: {d_ok} OK, {d_err} errors")

    print("\n" + "=" * 60)
    print("IMPORT COMPLETE")
    print(f"  Vouchers inserted: {v_ok} / {len(vouchers)}")
    print(f"  Details inserted:  {d_ok} / {len(details)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
