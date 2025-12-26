import FreeGrid from "../components/FreeGrid";
import { generateData } from "../mock/data";

function PageGrid() {
  const data = generateData(100_000);
  return <FreeGrid rowData={data} />;
}

export default PageGrid;
