"use client";

import { useState } from "react";

interface OrgNode {
  name: string;
  role: string;
  vacant?: boolean;
  resigned?: boolean;
  legalRep?: boolean;   // 법인 Legal Representative
  actualHead?: boolean; // 실질 수장 (Legal Rep과 다를 때)
  children?: OrgNode[];
}

// ── 실제 조직도 데이터 (출처: 04_people/01_raw/org-charts/) ──────

const ORG_DATA: Record<string, OrgNode> = {
  HQ: {
    name: "Sangdon Joo", role: "CEO", actualHead: true,
    children: [{
      name: "Yoo Jihyun", role: "Chief of Staff", legalRep: true,
      children: [
        {
          name: "Nguyen Thi Tuong Vi", role: "Finance Controller",
          children: [
            { name: "Bui Cam Van", role: "Accountant" },
            { name: "Tran Thi Ngoc Giau", role: "Chief Accountant (Solagron 파견)" },
            { name: "Nguyen Thi Hong Y", role: "Accountant (Solagron 파견)" },
          ],
        },
        {
          name: "Ly Hoang Man Nhi", role: "Legal Director",
          children: [
            { name: "Le Thi Phuong Thao", role: "Legal Staff" },
            { name: "Phan Ngoc Truc Thy", role: "Legal Staff" },
          ],
        },
        {
          name: "Nguyen Thanh Tam", role: "HR cum Admin",
          children: [
            { name: "Nguyen Thanh Lam", role: "Admin" },
          ],
        },
      ],
    }],
  },

  Solagron: {
    name: "To Thi Ngoc Quynh", role: "PL", legalRep: true,
    children: [{
    name: "Nguyen Van Cu", role: "Factory Director", actualHead: true,
    children: [
      {
        name: "(VACANT)", role: "QA/QC Manager", vacant: true,
        children: [
          { name: "Pham Thi Ngoc Hue", role: "QC Staff" },
          { name: "Nguyen Ngoc Ngan", role: "QC Staff" },
        ],
      },
      { name: "Pham Thi Diem Trinh", role: "Lab Leader" },
      {
        name: "(VACANT)", role: "Production Manager", vacant: true,
        children: [
          { name: "Son Dien", role: "Cultivation" },
          {
            name: "Thach Thi Canh Na", role: "Processing Team Leader",
            children: [
              { name: "Thach Rang Say", role: "Process Operator" },
              { name: "Son Linh", role: "Process Operator" },
              { name: "Thach Ngoc Thanh", role: "Process Operator" },
              { name: "Kim Cuong", role: "Packing/Drying" },
              { name: "Kim Thi Prone", role: "Packing" },
            ],
          },
        ],
      },
      {
        name: "Nguyen Thanh Con", role: "Maintenance Leader",
        children: [
          { name: "Le Minh Khang", role: "Maintenance" },
          { name: "Duong Tan Loc", role: "Maintenance" },
          { name: "Le Phuoc Sang", role: "Maintenance", resigned: true },
        ],
      },
      {
        name: "Nguyen Ha Van Anh", role: "HR & Admin Supervisor",
        children: [
          { name: "Thach Rat", role: "Security" },
          { name: "Thach Sa Quone", role: "Security" },
          { name: "Nguyen Van O", role: "Security" },
          { name: "Thach So Thia", role: "Security" },
        ],
      },
      { name: "Doan Van Dung", role: "Warehouse" },
    ],
    }],
  },

  "Eco CM": {
    name: "Yoo Jihyun", role: "General Director", legalRep: true,
    children: [
      { name: "Lee Kyutae", role: "Technical Leader", actualHead: true },
      {
        name: "Admin", role: "Administrative",
        children: [
          { name: "Bui Thi Phuong", role: "Accountant" },
          { name: "Vo Anh Kha", role: "Admin" },
        ],
      },
      {
        name: "P1 Team", role: "Shrimp Farm",
        children: [{ name: "Huynh Tien Phong", role: "Team Leader" }],
      },
      {
        name: "P2 Team", role: "Shrimp Farm",
        children: [
          { name: "Tran Van Ngot", role: "Team Leader" },
          { name: "Vu Minh Nhi", role: "Member" },
          { name: "Huynh Viet Anh", role: "Member" },
        ],
      },
      {
        name: "P3 Team", role: "Shrimp Farm",
        children: [
          { name: "Pham Van Nam", role: "Team Leader" },
          { name: "Tu Phan Chi Thuc", role: "Member" },
          { name: "Nguyen Gia Huy", role: "Member" },
        ],
      },
    ],
  },

  BMD: {
    name: "Le Thi Thu Suong", role: "Overall Manager", legalRep: true, actualHead: true,
    children: [
      {
        name: "Nguyen Thi Xuan Thuy", role: "Manager",
        children: [
          { name: "Phan Lac Giang Dong", role: "Production Manager" },
          { name: "Pham Nguyen Huy Hoang", role: "Production Manager" },
          { name: "Le Phung Thao", role: "Production 1" },
          { name: "Lang Van Cuong", role: "Production 2" },
          { name: "Vi Thi Men", role: "Worker" },
          { name: "Dinh Thi Bich", role: "Worker" },
          { name: "Lu Van Manh", role: "Worker" },
          { name: "Vi Van Binh", role: "Worker" },
          { name: "Pham Nguyen Huy Hoang", role: "Infrastructure" },
        ],
      },
      { name: "Nguyen Hong Phuoc", role: "Warehouse" },
      { name: "Bui Thanh Long", role: "Sales" },
      { name: "Nguyen Dai Son", role: "Admin / Marketing" },
      { name: "Nguyen Thi Hong Thao", role: "HR" },
      { name: "Lo Thi Thong", role: "Accountant" },
    ],
  },

  Entoflow: {
    name: "Yoo Jihyun", role: "Project Director", legalRep: true,
    children: [{
    name: "Seo Youngin", role: "Project Leader", actualHead: true,
    children: [
      {
        name: "Doan Duy Tung", role: "Factory Manager",
        children: [
          { name: "Truong Van Tuan", role: "Machinery Operator" },
          { name: "Le Phu Tai", role: "Machinery Operator" },
          { name: "Tran Van Tuyen", role: "Machinery Operator" },
          { name: "Nguyen Tan Thao", role: "Cultivation Manager" },
        ],
      },
      { name: "Vo Thien Nhi", role: "Admin" },
    ],
    }],
  },
};

const COMPANIES = ["HQ", "Solagron", "Eco CM", "Entoflow", "BMD"];

// ── 노드 렌더러 ─────────────────────────────────────────────────

function OrgNode({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const boxColor =
    node.vacant   ? "bg-gray-100 border-dashed border-gray-300 text-gray-400" :
    node.resigned ? "bg-red-50 border-red-200 text-red-400 line-through" :
    depth === 0   ? "bg-purple-100 border-purple-300 text-purple-800" :
    depth === 1   ? "bg-blue-50 border-blue-200 text-blue-800" :
    depth === 2   ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                    "bg-gray-50 border-gray-200 text-gray-600";

  return (
    <div className="flex flex-col items-center">
      {/* 노드 박스 */}
      <button
        onClick={() => hasChildren && setOpen(o => !o)}
        className={`border rounded-lg px-3 py-2 text-center min-w-[110px] max-w-[150px] transition-all ${boxColor} ${hasChildren ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
      >
        <p className="text-xs font-semibold leading-tight">{node.name}</p>
        <p className="text-[10px] opacity-70 leading-tight mt-0.5">{node.role}</p>
        <div className="flex gap-1 justify-center mt-1 flex-wrap">
          {node.legalRep && (
            <span className="text-[8px] bg-orange-100 text-orange-600 px-1 rounded font-medium">법인장</span>
          )}
          {node.actualHead && !node.legalRep && (
            <span className="text-[8px] bg-emerald-100 text-emerald-600 px-1 rounded font-medium">실수장</span>
          )}
          {node.actualHead && node.legalRep && (
            <span className="text-[8px] bg-emerald-100 text-emerald-600 px-1 rounded font-medium">법인장=실수장</span>
          )}
        </div>
        {hasChildren && (
          <span className="text-[9px] opacity-50">{open ? "▲" : `▼ ${node.children!.length}`}</span>
        )}
      </button>

      {/* 자식 노드 */}
      {hasChildren && open && (
        <div className="flex flex-col items-center">
          {/* 수직선 */}
          <div className="w-px h-3 bg-gray-300" />
          {/* 가로선 + 자식들 */}
          <div className="flex items-start gap-2 relative">
            {node.children!.length > 1 && (
              <div
                className="absolute top-0 h-px bg-gray-300"
                style={{ left: "50%", right: "0", transform: "translateX(-50%)", width: `calc(100% - 60px)` }}
              />
            )}
            {node.children!.map((child, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-px h-3 bg-gray-300" />
                <OrgNode node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────────

export default function OrgChart() {
  const [idx, setIdx] = useState(0);
  const company = COMPANIES[idx];
  const root = ORG_DATA[company];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-5 py-6 mb-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 font-medium">Org Chart</p>
          <h3 className="text-base font-bold text-gray-900">{company}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIdx((idx - 1 + COMPANIES.length) % COMPANIES.length)}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
          >‹</button>
          <span className="text-[10px] text-gray-400">{idx + 1}/{COMPANIES.length}</span>
          <button
            onClick={() => setIdx((idx + 1) % COMPANIES.length)}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
          >›</button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {COMPANIES.map((c, i) => (
          <button
            key={c}
            onClick={() => setIdx(i)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
              i === idx ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >{c}</button>
        ))}
      </div>

      {/* 트리 */}
      <div className="overflow-x-auto pb-2">
        <div className="flex justify-center min-w-max">
          <OrgNode node={root} depth={0} />
        </div>
      </div>

      <p className="text-[9px] text-gray-300 mt-2 text-center">클릭하면 하위 팀 접기/펼치기</p>
    </div>
  );
}
