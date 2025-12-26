import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi } from "ag-grid-community";
import "./PriceBoard.ping.css";
import "./PriceBoard.css";

// Place large JSON at public/mock/data.json
const DATA_URL = "/mock/data.json";

const rowClassRules = {
  "row-pinned": (params: any) => !!params.node.rowPinned,

  "row-even": (params: any) =>
    !params.node.rowPinned && params.node.rowIndex % 2 === 0,

  "row-odd": (params: any) =>
    !params.node.rowPinned && params.node.rowIndex % 2 !== 0,
};

const formatNumber = (v: any) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return v.toLocaleString("en-US");
  return v;
};

const FLASH_MS = 350; // flash bg duration
const FLUSH_MS = 100; // how often we flush batched updates to DOM (100ms recommended)
const INCOMING_MS = 10; // simulate incoming updates every 10ms (can be very frequent)

const direction = (oldVal: any, newVal: any) => {
  if (oldVal == null || newVal == null) return "neutral";
  if (newVal > oldVal) return "up";
  if (newVal < oldVal) return "down";
  return "neutral";
};

/**
 * PingRenderer - small React cell renderer for the "ping/pin" column.
 * Uses params.context.togglePin(symbol) to toggle pin state.
 */
const PingRenderer: React.FC<any> = (props) => {
  const sym: string | undefined = props.data?.s;
  const pinnedSet: Set<string> | undefined = props.context?.pinnedSymbolsSet;
  const togglePin: ((s: string) => void) | undefined = props.context?.togglePin;

  const pinned = sym && pinnedSet ? pinnedSet.has(sym) : false;

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent row selection / other clicks
    if (!sym || !togglePin) return;
    togglePin(sym);
  };

  return (
    <button
      className={`ping-btn ${pinned ? "pinned" : ""}`}
      onClick={onClick}
      title={pinned ? "Unpin row" : "Pin row"}
      aria-label={pinned ? "Unpin row" : "Pin row"}
    >
      {pinned ? "📌" : "📍"}
    </button>
  );
};

export const PriceBoardJson: React.FC = () => {
  const gridApiRef = useRef<GridApi | null>(null);

  // authoritative copy of rows kept in memory
  const rowDataRef = useRef<any[]>([]);
  // pending updates map keyed by symbol -> newRow (last update wins within a batch)
  const pendingUpdatesRef = useRef<Map<string, any>>(new Map());
  // timers & timeouts
  const timersRef = useRef<number[]>([]);
  const timeoutsRef = useRef<number[]>([]);

  // index map for O(1) symbol -> index lookup (important for large datasets)
  const indexRef = useRef<Map<string, number>>(new Map());

  // pinned symbols (order matters: newest first)
  const [pinnedSymbols, setPinnedSymbols] = useState<string[]>([]);
  // pinnedTopRows holds the row objects shown in pinnedTop area (in same order as pinnedSymbols)
  const [pinnedTopRows, setPinnedTopRows] = useState<any[]>([]);
  // pinnedMeta keeps metadata to restore original position when unpinning
  // we store originalInitIndex (fixed at load time) rather than runtime index
  const pinnedMetaRef = useRef<
    Map<string, { row: any; originalInitIndex: number }>
  >(new Map());

  // UI state
  const [rowData, setRowData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [gridReady, setGridReady] = useState<boolean>(false);

  const onGridReady = useCallback((params: any) => {
    gridApiRef.current = params.api;
    try {
      params.api.sizeColumnsToFit();
    } catch (e) {
      /* ignore */
    }
    setGridReady(true);
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
      // Ping column (first column)
      {
        headerName: "",
        field: "ping",
        width: 60,
        pinned: "left",
        sortable: false,
        filter: false,
        cellRenderer: "pingRenderer",
        cellClass: "ping-cell",
      },

      {
        field: "s",
        headerName: "CK",
        width: 90,
        pinned: "left",
        cellClass: "symbol-cell",
      },

      {
        field: "h",
        headerName: "Trần",
        width: 80,
        valueFormatter: (p: any) => formatNumber(p.value),
        cellClass: (p: any) => combinedCellClass("h", p),
      },
      {
        field: "fl",
        headerName: "Sàn",
        width: 80,
        valueFormatter: (p: any) => formatNumber(p.value),
        cellClass: (p: any) => combinedCellClass("fl", p),
      },
      {
        field: "ce",
        headerName: "TC",
        width: 80,
        valueFormatter: (p: any) => formatNumber(p.value),
        cellClass: (p: any) => combinedCellClass("ce", p),
      },

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

      {
        headerName: "Khớp lệnh",
        headerClass: "group-khop-lenh",
        children: [
          {
            headerName: "Giá",
            field: "c",
            width: 90,
            cellClass: (p: any) =>
              "kl-cell " +
              (() => {
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
                const dirClass = p.data?._dir?.["c"]
                  ? getPersistentClass(p.data, "c")
                  : persistent;
                return dirClass + flash;
              })(),
          },
          {
            headerName: "KL",
            field: "vo",
            width: 100,
            cellClass: (p: any) => "kl-cell " + combinedCellClass("vo", p),
          },
          {
            headerName: "+/-",
            field: "ch",
            cellClass: (p: any) => "kl-cell " + combinedCellClass("ch", p),
            width: 80,
          },
          {
            headerName: "+/-(%)",
            field: "r",
            cellClass: (p: any) => "kl-cell " + combinedCellClass("r", p),
            width: 100,
          },
        ],
      },
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

  // load big JSON once
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(DATA_URL, { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("data is not an array");
        // ensure meta fields exist and set a stable init index for each row
        const prepared = data.map((r: any, i: number) => ({
          ...r,
          _dir: {},
          _changes: undefined,
          _lastUpdate: undefined,
          __initIndex: i, // stable initial position used to restore order on unpin
        }));
        rowDataRef.current = prepared;
        // build index map for O(1) lookup
        const m = new Map<string, number>();
        prepared.forEach((r: any, i: number) => m.set(r.s, i));
        indexRef.current = m;

        setRowData(prepared); // initially feed grid
        setLoading(false);
        console.log("Loaded rows:", prepared.length);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Failed to load mock data", err);
        setLoadError(String(err?.message ?? err));
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  // Helper: create a random update for a single row (same logic as before)
  const makeRandomUpdate = (oldRow: any) => {
    const newRow = {
      ...oldRow,
      bb: oldRow.bb ? oldRow.bb.map((x: any) => ({ ...x })) : [],
      bo: oldRow.bo ? oldRow.bo.map((x: any) => ({ ...x })) : [],
    };
    const changes: Record<string, "up" | "down" | "neutral"> = {};

    // top-level random changes
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

    // c
    const oldC = newRow.c ?? 0;
    if (Math.random() < 0.9) {
      const tick = Math.random() > 0.6 ? (Math.random() > 0.5 ? 10 : -10) : 0;
      const big = Math.random() > 0.98 ? (Math.random() > 0.5 ? 50 : -50) : 0;
      const updatedC = Math.max(0, oldC + tick + big);
      changes["c"] = direction(oldC, updatedC);
      newRow.c = updatedC;
    }

    // ch, r
    const computedCh = newRow.c - (newRow.o ?? 0);
    changes["ch"] = direction(newRow.ch ?? 0, computedCh);
    newRow.ch = computedCh;

    const computedR = newRow.o
      ? Number(((newRow.ch / newRow.o) * 100).toFixed(2))
      : 0;
    changes["r"] = direction(newRow.r ?? 0, computedR);
    newRow.r = computedR;

    // vol/va
    const addVol = Math.floor(Math.random() * 5000);
    changes["vo"] = direction(newRow.vo, (newRow.vo ?? 0) + addVol);
    newRow.vo = (newRow.vo ?? 0) + addVol;
    changes["va"] = direction(
      newRow.va,
      (newRow.va ?? 0) + addVol * (newRow.c ?? 0)
    );
    newRow.va = (newRow.va ?? 0) + addVol * (newRow.c ?? 0);

    // book changes
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

    // merge persistent direction (oldRow._dir)
    const oldDir = oldRow && oldRow._dir ? { ...oldRow._dir } : {};
    const newDir = { ...oldDir };
    Object.keys(changes).forEach((k) => {
      if (changes[k] && changes[k] !== "neutral") newDir[k] = changes[k];
    });

    newRow._dir = newDir;
    newRow._changes = changes;
    newRow._lastUpdate = Date.now();

    return newRow;
  };

  // Toggle pin for a symbol. If pinned, unpin; if not pinned, pin (move to top).
  const togglePin = useCallback((sym: string) => {
    // use functional state to avoid stale closures
    setPinnedSymbols((prev) => {
      const currentlyPinned = prev.includes(sym);
      if (currentlyPinned) {
        // UNPIN: restore using __initIndex (stable initial order)
        const meta = pinnedMetaRef.current.get(sym);
        pinnedMetaRef.current.delete(sym);

        // remove from pinnedTopRows
        setPinnedTopRows((prevPinnedRows) =>
          prevPinnedRows.filter((r) => r.s !== sym)
        );

        setRowData((prevRows) => {
          const copy = prevRows.slice();

          const insertInitIndex = meta?.originalInitIndex;
          if (insertInitIndex === undefined) {
            // nothing to restore, just return unchanged
            return copy;
          }

          // find first position where __initIndex > insertInitIndex
          let insertPos = copy.findIndex(
            (r) => (r.__initIndex ?? Infinity) > insertInitIndex
          );

          if (insertPos === -1) {
            // append to end
            copy.push(meta?.row);
          } else {
            copy.splice(insertPos, 0, meta?.row);
          }

          // rebuild indexRef from copy
          const m = new Map<string, number>();
          copy.forEach((r: any, i: number) => m.set(r.s, i));
          indexRef.current = m;
          // update authoritative
          rowDataRef.current = copy;
          return copy;
        });

        return prev.filter((s) => s !== sym);
      } else {
        // PIN: remove from main list and add to pinnedTopRows
        setRowData((prevRows) => {
          const copy = prevRows.slice();
          const pos = indexRef.current.get(sym);
          let removedRow: any;
          let removedIndex = -1;
          if (pos !== undefined) {
            removedRow = copy.splice(pos, 1)[0];
            removedIndex = pos;
          } else {
            // fallback: find index
            const idx = copy.findIndex((r) => r.s === sym);
            if (idx >= 0) {
              removedRow = copy.splice(idx, 1)[0];
              removedIndex = idx;
            }
          }

          // store meta for unpin restore using stable __initIndex
          if (removedRow) {
            const originalInitIndex = removedRow.__initIndex ?? removedIndex;
            pinnedMetaRef.current.set(sym, {
              row: removedRow,
              originalIndex: removedIndex,
              originalInitIndex,
            } as any);
            // update pinnedTopRows (add to front)
            setPinnedTopRows((prevPinned) => [removedRow, ...prevPinned]);
          }

          // rebuild indexRef after removal
          const m = new Map<string, number>();
          copy.forEach((r: any, i: number) => m.set(r.s, i));
          indexRef.current = m;
          rowDataRef.current = copy;
          return copy;
        });

        return [sym, ...prev];
      }
    });
  }, []);

  // Recompute pinnedTopRows when pinnedSymbols changes only (we already update pinnedTopRows on pin/unpin)
  useEffect(() => {
    // ensure pinnedTopRows reflect latest rows from pinnedMetaRef (for updates)
    setPinnedTopRows(() => {
      const newPinned = pinnedSymbols
        .map((sym) => {
          const meta = pinnedMetaRef.current.get(sym);
          if (meta) return meta.row;
          // if not in meta, try to find in rowDataRef
          const pos = indexRef.current.get(sym);
          return pos !== undefined ? rowDataRef.current[pos] : undefined;
        })
        .filter(Boolean);
      return newPinned;
    });
  }, [pinnedSymbols]);

  // Simulate incoming high-frequency updates: push updates into pendingUpdatesRef
  useEffect(() => {
    // ONLY simulate when initial data loaded
    if (loading) return;

    const incomingId = window.setInterval(() => {
      try {
        const rows = rowDataRef.current;
        // if all rows are pinned (unlikely), still handle pinned updates via pinnedMetaRef
        if ((!rows || rows.length === 0) && pinnedMetaRef.current.size === 0)
          return;

        // choose a random row among combined symbols (main + pinned)
        const allSymbols: string[] = [
          ...rowDataRef.current.map((r) => r.s),
          ...Array.from(pinnedMetaRef.current.keys()).filter(
            (s) => !indexRef.current.has(s)
          ),
        ];
        if (allSymbols.length === 0) return;
        const idx = Math.floor(Math.random() * allSymbols.length);
        const sym = allSymbols[idx];
        const pos = indexRef.current.get(sym);
        const oldRow =
          pos !== undefined
            ? rowDataRef.current[pos]
            : pinnedMetaRef.current.get(sym)?.row;
        if (!oldRow) return;

        const newRow = makeRandomUpdate(oldRow);
        // store in pending map (last write wins within batch)
        pendingUpdatesRef.current.set(newRow.s, newRow);

        // also update authoritative copy (so memory state stays current)
        if (pos !== undefined) {
          rowDataRef.current[pos] = newRow;
        } else {
          // pinned row
          const meta = pinnedMetaRef.current.get(newRow.s);
          if (meta) {
            meta.row = newRow;
            pinnedMetaRef.current.set(newRow.s, meta);
            // update pinnedTopRows state quickly
            setPinnedTopRows((prev) =>
              prev.map((r) => (r.s === newRow.s ? newRow : r))
            );
          }
        }
      } catch (e) {
        // ignore for demo
      }
    }, INCOMING_MS);
    timersRef.current.push(incomingId as unknown as number);

    return () => {
      // clear incoming timers created by this effect
      timersRef.current.forEach((t) => clearInterval(t));
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Flush pending updates to DOM every FLUSH_MS (batching + throttle)
  useEffect(() => {
    if (loading || !gridReady) return;

    const flushId = window.setInterval(() => {
      try {
        const api = gridApiRef.current;
        if (!api) return;
        const pending = pendingUpdatesRef.current;
        if (!pending || pending.size === 0) return;

        // find currently rendered row symbols (virtualized viewport)
        const renderedNodes = api.getRenderedNodes(); // only visible rows have DOM nodes
        const renderedIds = new Set<string>(
          renderedNodes.map((n) => n.data?.s).filter(Boolean)
        );

        const updatesForDom: any[] = [];
        // apply pending updates: for visible rows -> include in updatesForDom
        // always update authoritative rowDataRef or pinnedMetaRef
        pending.forEach((newRow, sym) => {
          const pos = indexRef.current.get(sym);
          if (pos !== undefined) {
            rowDataRef.current[pos] = newRow;
          } else {
            // pinned row
            const meta = pinnedMetaRef.current.get(sym);
            if (meta) {
              meta.row = newRow;
              pinnedMetaRef.current.set(sym, meta);
            }
          }

          if (renderedIds.has(sym)) {
            updatesForDom.push(newRow);
          }
        });

        // apply batch to ag-grid only for visible rows (reduces DOM churn)
        if (updatesForDom.length > 0) {
          api.applyTransaction({ update: updatesForDom });
        }

        // Optionally sync React state occasionally (not each flush). Here we sync every flush but
        // only the visible updates won't be costly since React doesn't re-render each cell.
        if (updatesForDom.length > 0) {
          setRowData((prev) => {
            // efficient index-based merge using indexRef
            const copy = prev.slice();
            updatesForDom.forEach((u) => {
              const pos = indexRef.current.get(u.s);
              if (pos !== undefined) copy[pos] = u;
            });
            return copy;
          });
        }

        // schedule clearing of _changes for those rows (flash)
        updatesForDom.forEach((u) => {
          const tid = window.setTimeout(() => {
            try {
              const rowNode = api.getRowNode(u.s);
              if (!rowNode) return;
              const cleared = {
                ...rowNode.data,
                _changes: undefined,
                _lastUpdate: undefined,
              };
              api.applyTransaction({ update: [cleared] });
              // also reflect in memory and optional react state
              const pos = indexRef.current.get(cleared.s);
              if (pos !== undefined) rowDataRef.current[pos] = cleared;
              else {
                const meta = pinnedMetaRef.current.get(cleared.s);
                if (meta) meta.row = cleared;
              }
              setRowData((prev) =>
                prev.map((r) => (r.s === cleared.s ? cleared : r))
              );
              setPinnedTopRows((prev) =>
                prev.map((r) => (r.s === cleared.s ? cleared : r))
              );
            } catch (e) {
              /* ignore */
            }
          }, FLASH_MS + 40);
          timeoutsRef.current.push(tid as unknown as number);
        });

        // clear pending map
        pending.clear();
      } catch (e) {
        // ignore
      }
    }, FLUSH_MS);
    timersRef.current.push(flushId as unknown as number);

    return () => {
      // cleanup flush timer + any scheduled timeouts
      timersRef.current.forEach((t) => clearInterval(t));
      timersRef.current = [];
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
    // run whenever loading/gridReady change
  }, [loading, gridReady]);

  const getRowId = useCallback((params: any) => params.data.s, []);

  // context passed to cell renderers
  const gridContext = useMemo(
    () => ({
      togglePin,
      pinnedSymbolsSet: new Set(pinnedSymbols),
      pinnedSymbols,
    }),
    [pinnedSymbols, togglePin]
  );

  return (
    <div className="priceboard-root">
      {loading && (
        <div style={{ color: "#c7c7c7", padding: 8 }}>Loading data...</div>
      )}
      {loadError && (
        <div style={{ color: "salmon", padding: 8 }}>
          Load error: {loadError}
        </div>
      )}

      <div
        className="ag-theme-alpine-dark"
        style={{ height: 520, width: "100%" }}
      >
        <AgGridReact
          onGridReady={onGridReady}
          rowData={rowData}
          pinnedTopRowData={pinnedTopRows}
          components={{ pingRenderer: PingRenderer }}
          context={gridContext}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          rowSelection="single"
          rowClassRules={rowClassRules}
          suppressRowClickSelection
          animateRows={false}
          getRowId={getRowId}
          // keep cell flash off (we implement our own)
          cellFlashDuration={0}
        />
      </div>
    </div>
  );
};

export default PriceBoardJson;
