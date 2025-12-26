import TradingViewChart from "../components/TradingViewChart";

function TradingViewPage() {
  return (
    <div style={{ background: "#0b1220", minHeight: "100vh", padding: 16 }}>
      <h2 style={{ color: "#fff" }}>TradingView Embed Test</h2>

      <TradingViewChart />
    </div>
  );
}

export default TradingViewPage;
