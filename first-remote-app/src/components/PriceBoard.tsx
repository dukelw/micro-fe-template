import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi } from "ag-grid-community";
import "./PriceBoard.css";
import { MOCK_DATA } from "../mock/data";

const formatNumber = (v: any) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return v.toLocaleString("en-US");
  return v;
};

const FLASH_MS = 350; // thời gian flash cho mỗi ô (ms)

export const PriceBoard: React.FC = () => {
  const gridApiRef = useRef<GridApi | null>(null);
  const rowDataRef = useRef<any[]>(MOCK_DATA.map((r) => ({ ...r })));
  const timeoutsRef = useRef<number[]>([]); // lưu timeout ids để clear khi unmount

  const [rowData, setRowData] = useState<any[]>(() =>
    rowDataRef.current.slice()
  );

  const onGridReady = useCallback((params: any) => {
    gridApiRef.current = params.api;
    params.api.sizeColumnsToFit();
  }, []);

  const defaultColDef: ColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: false,
      cellStyle: {
        fontSize: "13px",
        padding: "2px 6px",
        transition: "color 160ms ease",
      },
    }),
    []
  );

  const direction = (oldVal: any, newVal: any) => {
    if (oldVal == null || newVal == null) return "neutral";
    if (newVal > oldVal) return "up";
    if (newVal < oldVal) return "down";
    return "neutral";
  };

  // persistent class from _dir and combine with transient flash from _changes
  const getPersistentClass = (data: any, field: string) => {
    const dir = data?._dir?.[field];
    if (dir === "up") return "cell-up";
    if (dir === "down") return "cell-down";
    return "cell-neutral";
  };

  const combinedCellClass = (field: string, params: any) => {
    const data = params?.data;
    if (!data) return "";
    const persistent = getPersistentClass(data, field) || "";
    const ch = data?._changes?.[field];
    const last = data?._lastUpdate;
    const flash =
      ch && last && Date.now() - last < FLASH_MS ? ` flash-${ch}` : "";
    return persistent + flash;
  };

  const columns: ColDef[] = useMemo(
    () => [
      {
        field: "s",
        headerName: "CK",
        width: 90,
        pinned: "left",
        cellClass: "symbol-cell",
      },

      // top-level
      {
        field: "h",
        headerName: "Trần",
        width: 80,
        valueFormatter: (p) => formatNumber(p.value),
        cellClass: (p: any) => combinedCellClass("h", p),
      },
      {
        field: "fl",
        headerName: "Sàn",
        width: 80,
        valueFormatter: (p) => formatNumber(p.value),
        cellClass: (p: any) => combinedCellClass("fl", p),
      },
      {
        field: "ce",
        headerName: "TC",
        width: 80,
        valueFormatter: (p) => formatNumber(p.value),
        cellClass: (p: any) => combinedCellClass("ce", p),
      },

      // Bên mua
      {
        headerName: "Bên mua",
        children: [
          {
            headerName: "Giá 3",
            field: "bb3p",
            width: 80,
            valueGetter: (params: any) => params.data.bb?.[0]?.p ?? "",
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("bb[0].p", p),
          },
          {
            headerName: "KL 3",
            field: "bb3v",
            width: 90,
            valueGetter: (params: any) => params.data.bb?.[0]?.v ?? "",
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("bb[0].v", p),
          },

          {
            headerName: "Giá 2",
            field: "bb2p",
            width: 80,
            valueGetter: (params: any) => params.data.bb?.[1]?.p ?? "",
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("bb[1].p", p),
          },
          {
            headerName: "KL 2",
            field: "bb2v",
            width: 90,
            valueGetter: (params: any) => params.data.bb?.[1]?.v ?? "",
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("bb[1].v", p),
          },

          {
            headerName: "Giá 1",
            field: "bb1p",
            width: 80,
            valueGetter: (params: any) => params.data.bb?.[2]?.p ?? "",
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("bb[2].p", p),
          },
          {
            headerName: "KL 1",
            field: "bb1v",
            width: 90,
            valueGetter: (params: any) => params.data.bb?.[2]?.v ?? "",
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("bb[2].v", p),
          },
        ],
      },

      // Khớp lệnh
      {
        headerName: "Khớp lệnh",
        children: [
          {
            headerName: "Giá",
            field: "c",
            width: 90,
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => {
              if (!p.data) return "";
              const persistent =
                p.data.ch > 0
                  ? "cell-up"
                  : p.data.ch < 0
                  ? "cell-down"
                  : "cell-neutral";
              const ch = p.data?._changes?.["c"];
              const last = p.data?._lastUpdate;
              const flash =
                ch && last && Date.now() - last < FLASH_MS
                  ? ` flash-${ch}`
                  : "";
              // keep persistent based on ch but still support explicit persistent _dir if present
              const dirClass = p.data?._dir?.["c"]
                ? getPersistentClass(p.data, "c")
                : persistent;
              return dirClass + flash;
            },
          },
          {
            headerName: "KL",
            field: "vo",
            width: 110,
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("vo", p),
          },
          {
            headerName: "+/-",
            field: "ch",
            width: 80,
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("ch", p),
          },
          {
            headerName: "+/-(%)",
            field: "r",
            width: 90,
            valueFormatter: (p: any) =>
              p.value !== undefined ? `${p.value}%` : "",
            cellClass: (p: any) => combinedCellClass("r", p),
          },
        ],
      },

      // Bên bán
      {
        headerName: "Bên bán",
        children: [
          {
            headerName: "Giá 1",
            field: "bo1p",
            width: 80,
            valueGetter: (params: any) => params.data.bo?.[0]?.p ?? "",
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("bo[0].p", p),
          },
          {
            headerName: "KL 1",
            field: "bo1v",
            width: 90,
            valueGetter: (params: any) => params.data.bo?.[0]?.v ?? "",
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("bo[0].v", p),
          },

          {
            headerName: "Giá 2",
            field: "bo2p",
            width: 80,
            valueGetter: (params: any) => params.data.bo?.[1]?.p ?? "",
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("bo[1].p", p),
          },
          {
            headerName: "KL 2",
            field: "bo2v",
            width: 90,
            valueGetter: (params: any) => params.data.bo?.[1]?.v ?? "",
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("bo[1].v", p),
          },

          {
            headerName: "Giá 3",
            field: "bo3p",
            width: 80,
            valueGetter: (params: any) => params.data.bo?.[2]?.p ?? "",
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("bo[2].p", p),
          },
          {
            headerName: "KL 3",
            field: "bo3v",
            width: 90,
            valueGetter: (params: any) => params.data.bo?.[2]?.v ?? "",
            valueFormatter: (p: any) => formatNumber(p.value),
            cellClass: (p: any) => combinedCellClass("bo[2].v", p),
          },
        ],
      },

      {
        field: "vo",
        headerName: "Tổng KL",
        width: 120,
        valueFormatter: (p: any) => formatNumber(p.value),
        cellClass: (p: any) => combinedCellClass("vo", p),
      },
      {
        field: "odH",
        headerName: "Cao",
        width: 90,
        valueFormatter: (p: any) => formatNumber(p.value),
        cellClass: (p: any) => combinedCellClass("odH", p),
      },
      {
        field: "odL",
        headerName: "Thấp",
        width: 90,
        valueFormatter: (p: any) => formatNumber(p.value),
        cellClass: (p: any) => combinedCellClass("odL", p),
      },
    ],
    []
  );

  // realtime: update one random row but randomize many fields (so "all columns" có thể thay đổi)
  useEffect(() => {
    // ensure rowDataRef kept in sync
    rowDataRef.current = rowDataRef.current.length
      ? rowDataRef.current
      : MOCK_DATA.map((r) => ({ ...r }));

    const id = window.setInterval(() => {
      try {
        const api = gridApiRef.current;
        if (!api) return;
        const currentRows = rowDataRef.current;
        if (!currentRows || currentRows.length === 0) return;
        const idx = Math.floor(Math.random() * currentRows.length);
        const oldRow = currentRows[idx];
        if (!oldRow) return;

        const newRow = {
          ...oldRow,
          bb: oldRow.bb ? oldRow.bb.map((x: any) => ({ ...x })) : [],
          bo: oldRow.bo ? oldRow.bo.map((x: any) => ({ ...x })) : [],
        };

        const changes: Record<string, "up" | "down" | "neutral"> = {};

        // Randomly change top-level numeric fields with some probability
        const topPriceFields = ["h", "fl", "ce", "odH", "odL"];
        topPriceFields.forEach((f) => {
          if (Math.random() < 0.25) {
            const old = newRow[f] ?? 0;
            const delta =
              (Math.random() > 0.5 ? 1 : -1) *
              (10 * (1 + Math.floor(Math.random() * 3)));
            const updated = Math.max(0, old + delta);
            changes[f] = direction(old, updated);
            newRow[f] = updated;
          }
        });

        // Price c: more likely to change
        const oldC = newRow.c ?? 0;
        if (Math.random() < 0.9) {
          const tick =
            Math.random() > 0.6 ? (Math.random() > 0.5 ? 10 : -10) : 0;
          const big =
            Math.random() > 0.98 ? (Math.random() > 0.5 ? 50 : -50) : 0;
          const updatedC = Math.max(0, oldC + tick + big);
          changes["c"] = direction(oldC, updatedC);
          newRow.c = updatedC;
        }

        // ch and r recompute based on o
        const oldCh = newRow.ch ?? 0;
        const computedCh = newRow.c - (newRow.o ?? 0);
        changes["ch"] = direction(oldCh, computedCh);
        newRow.ch = computedCh;

        const oldR = newRow.r ?? 0;
        const computedR = newRow.o
          ? Number(((newRow.ch / newRow.o) * 100).toFixed(2))
          : 0;
        changes["r"] = direction(oldR, computedR);
        newRow.r = computedR;

        // volume and value likely to change
        const addVol = Math.floor(Math.random() * 5000);
        changes["vo"] = direction(newRow.vo, (newRow.vo ?? 0) + addVol);
        newRow.vo = (newRow.vo ?? 0) + addVol;

        changes["va"] = direction(
          newRow.va,
          (newRow.va ?? 0) + addVol * (newRow.c ?? 0)
        );
        newRow.va = (newRow.va ?? 0) + addVol * (newRow.c ?? 0);

        // mutate book levels (both price and vol) for each level with some probability
        for (let i = 0; i < 3; i++) {
          if (newRow.bb && newRow.bb[i]) {
            if (Math.random() < 0.6) {
              const oldV = newRow.bb[i].v ?? 0;
              const newV = Math.max(
                0,
                oldV + Math.floor((Math.random() - 0.5) * 3000)
              );
              changes[`bb[${i}].v`] = direction(oldV, newV);
              newRow.bb[i].v = newV;
            }
            if (Math.random() < 0.2) {
              const oldP = newRow.bb[i].p ?? 0;
              const newP = Math.max(0, oldP + (Math.random() > 0.5 ? 10 : -10));
              changes[`bb[${i}].p`] = direction(oldP, newP);
              newRow.bb[i].p = newP;
            }
          }
          if (newRow.bo && newRow.bo[i]) {
            if (Math.random() < 0.6) {
              const oldV = newRow.bo[i].v ?? 0;
              const newV = Math.max(
                0,
                oldV + Math.floor((Math.random() - 0.5) * 3000)
              );
              changes[`bo[${i}].v`] = direction(oldV, newV);
              newRow.bo[i].v = newV;
            }
            if (Math.random() < 0.2) {
              const oldP = newRow.bo[i].p ?? 0;
              const newP = Math.max(0, oldP + (Math.random() > 0.5 ? 10 : -10));
              changes[`bo[${i}].p`] = direction(oldP, newP);
              newRow.bo[i].p = newP;
            }
          }
        }

        // Merge persistent directions: keep old _dir then overwrite fields that changed (non-neutral)
        const oldDir = oldRow && oldRow._dir ? { ...oldRow._dir } : {};
        const newDir = { ...oldDir };
        Object.keys(changes).forEach((k) => {
          if (changes[k] && changes[k] !== "neutral") {
            newDir[k] = changes[k];
          }
        });

        // Attach metadata
        newRow._dir = newDir;
        newRow._changes = changes;
        newRow._lastUpdate = Date.now();

        // Update grid and local state
        api.applyTransaction({ update: [newRow] });

        // sync local copy & ref
        setRowData((prev) => {
          const copy = prev.map((r) => (r.s === newRow.s ? newRow : r));
          rowDataRef.current = copy;
          return copy;
        });

        // schedule clear of flash flags
        const tid = window.setTimeout(() => {
          try {
            const rowNode = api.getRowNode(newRow.s);
            if (!rowNode) return;
            const cleared = {
              ...rowNode.data,
              _changes: undefined,
              _lastUpdate: undefined,
            };
            api.applyTransaction({ update: [cleared] });
            setRowData((prev) => {
              const copy = prev.map((r) => (r.s === cleared.s ? cleared : r));
              rowDataRef.current = copy;
              return copy;
            });
          } catch (e) {
            // ignore in demo
          }
        }, FLASH_MS + 40);
        timeoutsRef.current.push(tid as unknown as number);
      } catch (e) {
        // ignore for demo
      }
    }, 450);

    return () => {
      // cleanup interval + timeouts
      clearInterval(id);
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
    // intentionally no dependency on rowData to keep interval stable
  }, []);

  const getRowId = useCallback((params: any) => params.data.s, []);

  return (
    <div className="priceboard-root">
      <div
        className="ag-theme-alpine-dark"
        style={{ height: 520, width: "100%" }}
      >
        <AgGridReact
          onGridReady={onGridReady}
          rowData={rowData}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          rowSelection="single"
          suppressRowClickSelection
          animateRows={false}
          getRowId={getRowId}
          cellFlashDuration={0}
        />
      </div>
    </div>
  );
};

export default PriceBoard;
