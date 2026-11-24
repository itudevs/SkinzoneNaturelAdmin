// @ts-nocheck

import { useMemo, useState } from "react";

import Card from "@mui/material/Card";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import DefaultDoughnutChart from "examples/Charts/DoughnutCharts/DefaultDoughnutChart";

const treatments = [
  { name: "Deep Cleansing Facial", category: "Facial", price: 650 },
  { name: "Body Sculpting", category: "Body", price: 850 },
  { name: "Skin Renewal Peel", category: "Chemical Peel", price: 750 },
];

const stockItems = [
  { name: "Cleanser", amountAvailable: 12, clinicalPrice: 280, category: "GENOP" },
  { name: "Moisturiser", amountAvailable: 8, clinicalPrice: 650, category: "Lamelle" },
  { name: "Sunscreen", amountAvailable: 20, clinicalPrice: 450, category: "Fargon" },
  { name: "Serum", amountAvailable: 15, clinicalPrice: 520, category: "Evolution" },
];

const sales = [
  {
    saleId: 1,
    date: "2026-11-03",
    items: [{ name: "Deep Cleansing Facial", type: "Treatment", amount: 650, quantity: 1 }],
  },
  {
    saleId: 2,
    date: "2026-11-05",
    items: [
      { name: "Body Sculpting", type: "Treatment", amount: 850, quantity: 1 },
      { name: "Lamelle Moisturiser", type: "Product", amount: 650, quantity: 1 },
    ],
  },
  {
    saleId: 3,
    date: "2026-11-08",
    items: [{ name: "Skin Renewal Peel", type: "Treatment", amount: 750, quantity: 1 }],
  },
  {
    saleId: 4,
    date: "2026-11-10",
    items: [
      { name: "GENOP Cleanser", type: "Product", amount: 560, quantity: 2 },
      { name: "Fargon Sunscreen", type: "Product", amount: 450, quantity: 1 },
    ],
  },
  {
    saleId: 5,
    date: "2026-11-12",
    items: [{ name: "Deep Cleansing Facial", type: "Treatment", amount: 650, quantity: 1 }],
  },
  {
    saleId: 6,
    date: "2026-11-15",
    items: [
      { name: "Evolution Serum", type: "Product", amount: 1040, quantity: 2 },
      { name: "Body Sculpting", type: "Treatment", amount: 850, quantity: 1 },
    ],
  },
];

const monthlySalesHistory = {
  "2025-12": 4850,
  "2026-01": 6200,
  "2026-02": 5750,
  "2026-03": 7100,
  "2026-04": 6800,
  "2026-05": 7450,
  "2026-06": 8200,
  "2026-07": 7900,
  "2026-08": 8750,
  "2026-09": 9100,
  "2026-10": 8650,
};

const expenses = [
  {
    expenseId: 1,
    name: "Stock delivery",
    quantity: 1,
    price: 1800,
    category: "Stock and Inventory",
    date: "2026-11-01",
  },
  {
    expenseId: 2,
    name: "Electricity",
    quantity: 1,
    price: 950,
    category: "Rent and Utilities",
    date: "2026-11-05",
  },
  {
    expenseId: 3,
    name: "Staff salaries",
    quantity: 1,
    price: 12500,
    category: "Salaries and Wages",
    date: "2026-11-10",
  },
];

const amount = (expense) => expense.quantity * expense.price;

function getPast12Months(today = new Date()) {
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (11 - index), 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
}

function getDateBounds(period, customStart = "", customEnd = "") {
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const startDate = new Date(today);

  if (period === "Custom") {
    return { start: customStart, end: customEnd };
  }

  if (period === "Today") {
    return { start: end, end };
  }
  if (period === "This Week") {
    startDate.setDate(today.getDate() - today.getDay());
  } else if (period === "This Month") {
    startDate.setDate(1);
  } else if (period === "Last Month") {
    startDate.setMonth(today.getMonth() - 1, 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
    return {
      start: startDate.toISOString().slice(0, 10),
      end: lastDay.toISOString().slice(0, 10),
    };
  } else if (period === "This Quarter") {
    startDate.setMonth(Math.floor(today.getMonth() / 3) * 3, 1);
  } else if (period === "This Year") {
    startDate.setMonth(0, 1);
  }

  return { start: startDate.toISOString().slice(0, 10), end };
}

function Dashboard() {
  const [period, setPeriod] = useState("This Month");
  const today = new Date();
  const [customStart, setCustomStart] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
  );
  const [customEnd, setCustomEnd] = useState(today.toISOString().slice(0, 10));
  const bounds = getDateBounds(period, customStart, customEnd);
  const past12Months = getPast12Months();

  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => expense.date >= bounds.start && expense.date <= bounds.end),
    [bounds.start, bounds.end]
  );
  const totalExpenditure = filteredExpenses.reduce((total, expense) => total + amount(expense), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const filteredSales = sales.filter(
    (sale) => sale.date >= bounds.start && sale.date <= bounds.end
  );
  const totalSales = filteredSales.reduce(
    (total, sale) => total + sale.items.reduce((saleTotal, item) => saleTotal + item.amount, 0),
    0
  );
  const currentMonthSales = sales
    .filter((sale) => sale.date.slice(0, 7) === currentMonth)
    .reduce(
      (total, sale) => total + sale.items.reduce((saleTotal, item) => saleTotal + item.amount, 0),
      0
    );
  const salesDays = new Set(filteredSales.map((sale) => sale.date)).size;
  const averageDailySales = salesDays ? totalSales / salesDays : 0;
  const profit = totalSales - totalExpenditure;

  const treatmentCategories = ["Facial", "Body", "Chemical Peel", "Other"];
  const treatmentTotals = treatmentCategories.map((category) => {
    const treatmentNames = treatments
      .filter((treatment) => treatment.category === category)
      .map((treatment) => treatment.name);
    return {
      category,
      total: filteredSales.reduce(
        (total, sale) =>
          total +
          sale.items
            .filter((item) => item.type === "Treatment" && treatmentNames.includes(item.name))
            .reduce((itemTotal, item) => itemTotal + item.amount, 0),
        0
      ),
    };
  });
  const highestTreatmentCategory = treatmentTotals.reduce(
    (highest, current) => (current.total > highest.total ? current : highest),
    { category: "None", total: 0 }
  );
  const stockCategories = [...new Set(stockItems.map((item) => item.category))];
  const productSalesTotals = stockCategories.map((category) => ({
    category,
    total: filteredSales.reduce(
      (total, sale) =>
        total +
        sale.items
          .filter(
            (item) =>
              item.type === "Product" && item.name.toUpperCase().includes(category.toUpperCase())
          )
          .reduce((itemTotal, item) => itemTotal + item.amount, 0),
      0
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDBox>
            <MDTypography variant="h4" fontWeight="medium">
              Business Dashboard
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Monitor sales, treatments, stock, expenses and profit performance.
            </MDTypography>
          </MDBox>
          <MDBox display="flex" alignItems="center" gap={1}>
            <FormControl sx={{ minWidth: 190 }}>
              <InputLabel shrink>Reporting period</InputLabel>
              <Select
                value={period}
                label="Reporting period"
                onChange={(event) => setPeriod(event.target.value)}
                sx={{ minHeight: 56 }}
              >
                {[
                  "Today",
                  "This Week",
                  "This Month",
                  "Last Month",
                  "This Quarter",
                  "This Year",
                  "Custom",
                ].map((option) => (
                  <MenuItem value={option} key={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {period === "Custom" && (
              <>
                <MDInput
                  type="date"
                  label="Start date"
                  value={customStart}
                  onChange={(event) => setCustomStart(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: customEnd || undefined }}
                  sx={{ minWidth: 155 }}
                />
                <MDInput
                  type="date"
                  label="End date"
                  value={customEnd}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: customStart || undefined }}
                  sx={{ minWidth: 155 }}
                />
              </>
            )}
          </MDBox>
        </MDBox>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={2.4}>
            <ComplexStatisticsCard
              color="dark"
              icon="point_of_sale"
              title="Total Sales"
              count={`R${totalSales.toFixed(2)}`}
              percentage={{ color: "success", amount: "", label: "selected period" }}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <ComplexStatisticsCard
              color="primary"
              icon="calendar_month"
              title="Monthly Sales"
              count={`R${currentMonthSales.toFixed(2)}`}
              percentage={{ color: "success", amount: "", label: "current month" }}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <ComplexStatisticsCard
              color="info"
              icon="trending_up"
              title="Average Daily Sales"
              count={`R${averageDailySales.toFixed(2)}`}
              percentage={{ color: "success", amount: "", label: "per sales day" }}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <ComplexStatisticsCard
              color="success"
              icon="spa"
              title="Highest Treatment Category"
              count={highestTreatmentCategory.category}
              percentage={{
                color: "success",
                amount: `R${highestTreatmentCategory.total.toFixed(2)}`,
                label: "sales",
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <ComplexStatisticsCard
              color="warning"
              icon="account_balance"
              title="Profit"
              count={`R${profit.toFixed(2)}`}
              percentage={{
                color: profit >= 0 ? "success" : "error",
                amount: "",
                label: "sales less expenditure",
              }}
            />
          </Grid>
        </Grid>

        <MDBox mt={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <ReportsLineChart
                color="dark"
                title="Monthly Sales Trend"
                description="Sales revenue over the selected reporting period"
                date={`${bounds.start} to ${bounds.end}`}
                chart={{
                  labels: past12Months.map((month) =>
                    new Intl.DateTimeFormat("en-ZA", { month: "short" }).format(
                      new Date(`${month}-01T00:00:00`)
                    )
                  ),
                  datasets: {
                    label: "Sales",
                    data: past12Months.map((month) => {
                      const salesForMonth = sales
                        .filter((sale) => sale.date.slice(0, 7) === month)
                        .reduce(
                          (total, sale) =>
                            total +
                            sale.items.reduce((saleTotal, item) => saleTotal + item.amount, 0),
                          0
                        );
                      return salesForMonth || monthlySalesHistory[month] || 0;
                    }),
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} lg={4}>
              <DefaultDoughnutChart
                icon={{ color: "success", component: "spa" }}
                title="Treatment Sales by Category"
                description="Selected period treatment distribution"
                chart={{
                  labels: treatmentTotals
                    .filter((item) => item.total > 0)
                    .map((item) => item.category),
                  datasets: {
                    label: "Treatment totals",
                    data: treatmentTotals
                      .filter((item) => item.total > 0)
                      .map((item) => item.total),
                    backgroundColors: ["primary", "success", "warning", "info", "error", "dark"],
                  },
                }}
              />
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mt={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <ReportsBarChart
                color="info"
                title="Treatment Category Comparison"
                description="Compare treatment sales by category"
                date={period}
                chart={{
                  labels: treatmentTotals.map((item) => item.category),
                  datasets: {
                    label: "Treatment sales",
                    data: treatmentTotals.map((item) => item.total),
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <ReportsBarChart
                color="success"
                title="Product Sales Comparison"
                description="Compare product sales by brand"
                date={period}
                chart={{
                  labels: productSalesTotals.map((item) => item.category),
                  datasets: {
                    label: "Product sales",
                    data: productSalesTotals.map((item) => item.total),
                  },
                }}
              />
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mt={4}>
          <Card>
            <MDBox p={3}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h6">Recent Expenditure Activity</MDTypography>
                <Link href="/expenditures">View all expenditures</Link>
              </MDBox>
              {filteredExpenses
                .slice(-5)
                .reverse()
                .map((expense) => (
                  <MDBox
                    key={expense.expenseId}
                    py={1.5}
                    display="flex"
                    justifyContent="space-between"
                  >
                    <MDBox>
                      <MDTypography variant="button" display="block">
                        {expense.name}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        {expense.category} · {expense.date}
                      </MDTypography>
                    </MDBox>
                    <MDTypography variant="button" fontWeight="medium">
                      R{amount(expense).toFixed(2)}
                    </MDTypography>
                  </MDBox>
                ))}
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
