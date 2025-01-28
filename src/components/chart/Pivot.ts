// Example: Pivot.ts
export const populateData = (props: any) => ({
  labels: props.labels || [], // Array of labels for X-axis
  datasets: [
    {
      label: "Dataset 1",
      data: props.data || [], // Array of Y-axis values
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ],
});

export const populateOptions = (props: any) => ({
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: "top",
    },
    title: {
      display: !!props.title,
      text: props.title || "",
    },
  },
});
