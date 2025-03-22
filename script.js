const API_KEY = "AIzaSyBjP7TNoMxHrYnAW65TwvIsUc1GwSaP66g";
const SEARCH_API = "https://www.googleapis.com/youtube/v3/search";
const CHANNEL_API = "https://www.googleapis.com/youtube/v3/channels";

const channelInput = document.getElementById("channelInput");
const searchButton = document.getElementById("searchButton");
const analyticsGrid = document.getElementById("analyticsGrid");

// Chart instances
let subscriberChart, videoChart, viewsChart, revenueChart, engagementChart, demographicsChart;

// RPM rates by country
const rpmRates = {
  US: 7.53,
  UK: 5.62,
  NZ: 5.56,
  AE: 2.33,
  PK: 2.5,
  IN: 2.5,
};

// Fetch channel data
async function fetchChannelData(query) {
  try {
    // Step 1: Search for the channel
    const searchResponse = await fetch(
      `${SEARCH_API}?part=snippet&q=${query}&type=channel&key=${API_KEY}`
    );
    const searchData = await searchResponse.json();
    const channelId = searchData.items[0].id.channelId;

    // Step 2: Get channel details
    const channelResponse = await fetch(
      `${CHANNEL_API}?part=snippet,statistics,status,brandingSettings&id=${channelId}&key=${API_KEY}`
    );
    const channelData = await channelResponse.json();
    return channelData.items[0];
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

// Display analytics
function displayAnalytics(data) {
  const snippet = data.snippet;
  const statistics = data.statistics;
  const brandingSettings = data.brandingSettings;
  const status = data.status;

  const revenue = calculateRevenue(statistics.viewCount, snippet.country);

  analyticsGrid.innerHTML = `
    <div><strong>Channel ID:</strong> ${data.id}</div>
    <div><strong>Channel Title:</strong> ${snippet.title}</div>
    <div><strong>Description:</strong> ${snippet.description || "N/A"}</div>
    <div><strong>Custom URL:</strong> ${brandingSettings.channel.customUrl || "N/A"}</div>
    <div><strong>Subscribers:</strong> ${statistics.subscriberCount || "N/A"}</div>
    <div><strong>Video Count:</strong> ${statistics.videoCount || "N/A"}</div>
    <div><strong>Views:</strong> ${statistics.viewCount || "N/A"}</div>
    <div><strong>Creation Date:</strong> ${snippet.publishedAt || "N/A"}</div>
    <div><strong>Profile Picture:</strong> <img src="${snippet.thumbnails.default.url}" alt="Profile Picture"></div>
    <div><strong>Country:</strong> ${snippet.country || "N/A"}</div>
    <div><strong>Status:</strong> ${status.isLinked ? "Active" : "Inactive"} | ${status.verified ? "Verified" : "Not Verified"}</div>
    <div><strong>Related Playlists:</strong> ${data.contentDetails?.relatedPlaylists?.uploads || "N/A"}</div>
    <div><strong>Keywords:</strong> ${brandingSettings.channel.keywords || "N/A"}</div>
    <div class="revenue-block">Total Revenue: $${revenue.toFixed(2)}</div>
  `;

  // Render charts
  renderCharts();
}

// Calculate revenue
function calculateRevenue(views, country) {
  const rpm = rpmRates[country] || 2.5; // Default RPM for unspecified countries
  return (views * rpm) / 1000;
}

// Render charts
function renderCharts() {
  const ctx1 = document.getElementById("subscriberChart").getContext("2d");
  const ctx2 = document.getElementById("videoChart").getContext("2d");
  const ctx3 = document.getElementById("viewsChart").getContext("2d");
  const ctx4 = document.getElementById("revenueChart").getContext("2d");
  const ctx5 = document.getElementById("engagementChart").getContext("2d");
  const ctx6 = document.getElementById("demographicsChart").getContext("2d");

  subscriberChart = new Chart(ctx1, { type: "line", data: { labels: ["Jan", "Feb", "Mar"], datasets: [{ label: "Subscribers", data: [100, 200, 300] }] } });
  videoChart = new Chart(ctx2, { type: "bar", data: { labels: ["Jan", "Feb", "Mar"], datasets: [{ label: "Videos", data: [5, 10, 15] }] } });
  viewsChart = new Chart(ctx3, { type: "pie", data: { labels: ["Jan", "Feb", "Mar"], datasets: [{ label: "Views", data: [1000, 2000, 3000] }] } });
  revenueChart = new Chart(ctx4, { type: "doughnut", data: { labels: ["Jan", "Feb", "Mar"], datasets: [{ label: "Revenue", data: [500, 1000, 1500] }] } });
  engagementChart = new Chart(ctx5, { type: "radar", data: { labels: ["Likes", "Comments", "Shares"], datasets: [{ label: "Engagement", data: [50, 70, 30] }] } });
  demographicsChart = new Chart(ctx6, { type: "polarArea", data: { labels: ["Male", "Female", "Other"], datasets: [{ label: "Demographics", data: [60, 30, 10] }] } });
}

// Event listener for search button
searchButton.addEventListener("click", async () => {
  const query = channelInput.value.trim();
  if (!query) return alert("Please enter a channel name or URL.");

  const channelData = await fetchChannelData(query);
  if (channelData) displayAnalytics(channelData);
});