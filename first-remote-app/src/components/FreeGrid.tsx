import { AgGridReact } from "ag-grid-react";
import { themeQuartz, ColDef } from "ag-grid-community";
import { useCallback } from "react";

const countryColors: Record<string, string> = {
  VN: "#22c55e",
  US: "#3b82f6",
  JP: "#ef4444",
  FR: "#6366f1",
};

const CountryCell = (props: any) => (
  <span
    style={{
      padding: "2px 8px",
      borderRadius: 6,
      background: countryColors[props.value],
      color: "#fff",
      fontSize: 12,
      fontWeight: 500,
    }}
  >
    {props.value}
  </span>
);

const SalaryCell = (props: any) => {
  const percent = (props.value / 5000) * 100;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 80,
          height: 6,
          background: "#052e16",
          borderRadius: 4,
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "#22c55e",
            borderRadius: 4,
          }}
        />
      </div>
      <span>${props.value.toLocaleString()}</span>
    </div>
  );
};

const AgeCell = (props: any) => {
  const color =
    props.value < 25 ? "#86efac" : props.value < 40 ? "#22c55e" : "#facc15";

  return <span style={{ color, fontWeight: 600 }}>{props.value}</span>;
};

const columnDefs: ColDef[] = [
  { field: "id", width: 70, pinned: "left" },
  { field: "name", minWidth: 150 },
  {
    field: "age",
    width: 90,
    cellRenderer: AgeCell,
  },
  {
    field: "country",
    width: 110,
    cellRenderer: CountryCell,
  },
  {
    field: "salary",
    minWidth: 200,
    cellRenderer: SalaryCell,
  },
];

// Professional Dark Theme
export const proDarkTheme = themeQuartz.withParams({
  /* Base */
  browserColorScheme: "dark",
  backgroundColor: "#0f172a", // slate-900
  foregroundColor: "#e5e7eb", // slate-200
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont",
  fontSize: 13,

  /* Header */
  headerBackgroundColor: "#020617", // slate-950
  headerFontSize: 13,
  headerFontWeight: 600,
  headerHeight: 44,

  /* Grid chrome */
  chromeBackgroundColor: {
    ref: "foregroundColor",
    mix: 0.06,
    onto: "backgroundColor",
  },
  borderColor: "#1e293b", // slate-800
  rowBorder: true,

  /* Rows */
  rowHeight: 36,
  rowHoverColor: "#1e293b",
  selectedRowBackgroundColor: "#1d4ed8", // blue-700
  oddRowBackgroundColor: "#020617",

  /* Cells */
  cellHorizontalPadding: 12,

  /* Inputs / filters */
  inputBackgroundColor: "#020617",

  /* Icons */
  iconColor: "#94a3b8",

  /* Tooltips */
  tooltipBackgroundColor: "#020617",
});

export const whiteGreenTheme = themeQuartz.withParams({
  /* Base */
  browserColorScheme: "light",
  backgroundColor: "#ffffff",
  foregroundColor: "#0f172a", // slate-900
  fontFamily: "Inter, system-ui, -apple-system",
  fontSize: 13,

  /* Accent (GREEN) */
  accentColor: "#22c55e", // green-500
  selectedRowBackgroundColor: "#dcfce7", // green-100
  rangeSelectionBorderColor: "#22c55e",

  /* Header */
  headerBackgroundColor: "#f8fafc", // slate-50
  headerFontWeight: 600,
  headerFontSize: 13,
  headerHeight: 44,

  /* Grid chrome */
  chromeBackgroundColor: "#ffffff",
  borderColor: "#e5e7eb", // gray-200
  rowBorder: true,

  /* Rows */
  rowHeight: 36,
  rowHoverColor: "#f0fdf4", // green-50
  oddRowBackgroundColor: "#fcfcfc",

  /* Cells */
  cellHorizontalPadding: 12,

  /* Inputs / filters */
  inputBackgroundColor: "#ffffff",

  /* Icons */
  iconColor: "#16a34a", // green-600

  /* Tooltips */
  tooltipBackgroundColor: "#020617",
  tooltipTextColor: "#ffffff",
});

export default function FreeGrid({ rowData }: { rowData: any[] }) {
  const onGridReady = useCallback((params: any) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div style={{ height: 500, width: "100%" }}>
      <AgGridReact
        theme={whiteGreenTheme}
        rowData={rowData}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
        }}
        pagination
        paginationPageSize={100}
      />
    </div>
  );
}
