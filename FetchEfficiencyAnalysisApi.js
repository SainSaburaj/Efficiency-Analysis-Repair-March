import { ref } from "vue";
import { generateEndPoint, unwrapInEscapedBody } from "@/utils/apiHelpers";

const END_POINTS = {
    // List Departments
    LIST_DEPARTMENTS: {
        endpointName: "BAG_REPORTS_APP_ENDPOINT",
        apiType: "listDepartments",
        name: "LIST_DEPARTMENTS",
    },

    // List Locations
    LIST_LOCATIONS: {
        endpointName: "BAG_REPORTS_APP_ENDPOINT",
        apiType: "listLocations",
        name: "LIST_LOCATIONS",
    },
    // List Efficiency Analysis
    LIST_EFFICIENCY_ANALYSIS: {
        endpointName: "BAG_REPORTS_APP_ENDPOINT",
        apiType: "listEfficiencyAnalysis",
        name: "LIST_EFFICIENCY_ANALYSIS",
    },
    // List Inventory Adjustments
    LIST_INVENTORY_ADJSUTMENTS: {
        endpointName: "BAG_REPORTS_APP_ENDPOINT",
        apiType: "listInventoryAdjustments",
        name: "LIST_INVENTORY_ADJSUTMENTS",
    },

};

export function useAllEfficiencyAnalysisApi() {
    const loading = ref(false);
    const error = ref(null);
    const listDepartments = ref([]);
    const loadingComponents = ref(false);
    const listLocationsData = ref([]);
    const listEfficiencyData = ref([]);
    const listInventoryAdjustments = ref([]);

    const fetchListDepartments = async (data) => {
        try {
            loading.value = true;
            error.value = null;
            const endpoint = "LIST_DEPARTMENTS";
            const response = await fetch(generateEndPoint(endpoint, END_POINTS), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseJson = await response.json();

            if (
                responseJson &&
                responseJson.status === "SUCCESS" &&
                responseJson.data
            ) {
                responseJson.data = unwrapInEscapedBody(responseJson.data);
                listDepartments.value = responseJson.data;
            } else {
                throw new Error(responseJson.reason || "Failed to fetch departments");
            }
        } catch (err) {
            error.value = err.message;
            console.error("Error fetching departments:", err);
        } finally {
            loading.value = false;
        }
    };


    // Fetch locations data
    const fetchlistLocations = async (data) => {
        try {
            loading.value = true;
            error.value = null;
            const endpoint = "LIST_LOCATIONS";
            const response = await fetch(generateEndPoint(endpoint, END_POINTS), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseJson = await response.json();

            if (responseJson && responseJson.status === "SUCCESS" && responseJson.data) {
                responseJson.data = unwrapInEscapedBody(responseJson.data);
                listLocationsData.value = responseJson.data; // Save data to the ref
            } else {
                throw new Error(responseJson.message || "Failed to fetch locations");
            }
        } catch (err) {
            error.value = err.message;
            console.error("Error fetching locations:", err);
        } finally {
            loading.value = false;
        }
    };
    //fetch efficiency analysis
    const fetchListEfficiencyAnalysis = async (locationId, startDate, endDate, isRepairOnly = null) => {
        try {
            // Log the parameters received by the API function
            console.log('=== API COMPOSABLE DATE LOGGING ===');
            console.log('fetchListEfficiencyAnalysis called with:', {
                locationId,
                startDate,
                endDate,
                isRepairOnly,
                startDateType: typeof startDate,
                endDateType: typeof endDate
            });

            loading.value = true;
            error.value = null;
            // Construct request payload
            const requestData = {
                location: locationId,
                startDate: startDate,
                endDate: endDate,
                isRepairOnly: isRepairOnly
            };
            
            console.log('Request payload being sent to backend:', JSON.stringify(requestData, null, 2));
            const endpoint = "LIST_EFFICIENCY_ANALYSIS";
            const response = await fetch(generateEndPoint(endpoint, END_POINTS), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            const responseJson = await response.json();

            if (responseJson && responseJson.status === "SUCCESS" && responseJson.data) {
                responseJson.data = unwrapInEscapedBody(responseJson.data);
                listEfficiencyData.value = responseJson.data; // Save data to the ref
            } else {
                throw new Error(responseJson.message || "Failed to fetch locations");
            }
        } catch (err) {
            error.value = err.message;
            console.error("Error fetching locations:", err);
        } finally {
            loading.value = false;
        }
    };
    //fetch inventory adjustments
    const fetchInventoryAdjustments = async (startDate, endDate) => {
        try {
            loading.value = true;
            error.value = null;
            const endpoint = "LIST_INVENTORY_ADJSUTMENTS";
            // Construct request payload
            const requestData = {
                startDate: startDate,
                endDate: endDate
            };
            const response = await fetch(generateEndPoint(endpoint, END_POINTS), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            const responseJson = await response.json();

            if (responseJson && responseJson.status === "SUCCESS" && responseJson.data) {
                responseJson.data = unwrapInEscapedBody(responseJson.data);
                listInventoryAdjustments.value = responseJson.data; // Save data to the ref
            } else {
                throw new Error(responseJson.message || "Failed to fetch locations");
            }
        } catch (err) {
            error.value = err.message;
            console.error("Error fetching fetchInventoryAdjustments:", err);
        } finally {
            loading.value = false;
        }
    }

    return {
        listDepartments,
        loading,
        loadingComponents,
        listInventoryAdjustments,
        error,
        fetchListDepartments,
        fetchlistLocations,
        listLocationsData,
        listEfficiencyData,
        fetchListEfficiencyAnalysis,
        fetchInventoryAdjustments
    };
}