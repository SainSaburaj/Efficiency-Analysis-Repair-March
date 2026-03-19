<template>
    <!-- No Data Popup Modal -->
    <div v-if="showNoDataPopup"
        class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm z-50 transition-opacity duration-300">
        <div class="bg-white p-8 rounded-xl shadow-2xl transform scale-95 transition-transform duration-300 ease-out">
            <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 flex justify-center items-center bg-red-100 rounded-full">
                    <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" stroke-width="2"
                        viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M18.364 18.364A9 9 0 115.636 5.636a9 9 0 0112.728 12.728z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 9l-6 6m0-6l6 6"></path>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-800">No Data Available</h2>
                <p class="text-gray-500 mt-2">Sorry, we couldn't find any data matching your criteria.</p>
                <button @click="closeNoDataPopup"
                    class="mt-6 px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition duration-200 transform hover:scale-105">
                    OK
                </button>
            </div>
        </div>
    </div>

    <div v-if="isInitialLoading || loading" class="flex justify-center items-center h-screen">
        <div class="animate-spin rounded-full h-10 w-10 border-t-4 border-gray-500"></div>
    </div>

    <div v-else class="flex h-screen">
        <!-- Sidebar -->
        <aside class="w-64 bg-gradient-to-b  text-white flex flex-col shadow-lg min-h-screen">
            <!-- Sidebar Header -->
            <div class="p-5 text-lg font-bold flex items-center space-x-2 text-gray-800">
                <i class="fas fa-map-marker-alt text-gray-800"></i>
                <span>LOCATION</span>
            </div>

            <nav class="flex-1 overflow-auto scrollbar-hidden">
                <div v-for="(location, index) in locations" :key="index">
                    <button @click="toggleLocationView(location.internalid.value)" class="flex justify-between items-center py-3 px-5 w-full text-sm font-semibold transition-all 
                         hover:bg-gray-100 hover:text-white hover:scale-105 focus:outline-none"
                        :class="{ 'bg-gray-730 text-white': expandedLocation === location.internalid.value }">


                        <div class="flex items-center space-x-2 text-gray-800">
                            <i class="fas fa-building text-gray-800 "></i>
                            <span>{{ formatName(location.name.value) }}</span>
                        </div>
                        <i
                            :class="expandedLocation === location.internalid.value ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                    </button>

                    <ul v-if="expandedLocation === location.internalid.value"
                        class="ml-5 text-gray-500 transition-all text-[12px]">
                        <li v-for="(dept, dIndex) in location.departments" :key="dIndex">
                            <div @click="toggleDepartmentView(dept.name)" class="flex justify-between items-center py-2 px-4 hover:bg-gray-650 hover:text-white hover:scale-105 
                                 cursor-pointer transition-all rounded-md text-[12px]"
                                :class="{ 'bg-gray-400 text-white': expandedDepartment === dept.name }">

                                <div class="flex items-center space-x-2 text-gray-800">
                                    <i class="fa fa-archive"></i>
                                    <span>{{ formatName(dept.name) }}</span>
                                </div>
                                <i
                                    :class="expandedDepartment === dept.name ? 'fas fa-chevron-down' : 'fas fa-chevron-right'"></i>
                            </div>

                            <ul v-if="expandedDepartment === dept.name"
                                class="ml-6 text-gray-400 transition-all text-[12px] text-gray-800">
                                <li v-for="(emp, eIndex) in dept.employees" :key="eIndex" class="py-1 px-5 hover:bg-gray-800 hover:text-white hover:scale-105 cursor-pointer 
                                      flex items-center space-x-2 transition-all text-[12px] rounded-md">
                                    <i class="fa fa-user"></i>
                                    <span>{{ formatName(emp.name) }}</span>
                                </li>

                            </ul>
                        </li>
                    </ul>

                </div>
            </nav>

        </aside>

        <!-- Main Content -->
        <main class="flex-1 p-8  overflow-auto scrollbar-hidden">
            <!-- Header Section -->
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold">{{ dashboardTitle }}</h1>

                <div class="flex items-center space-x-4">
                    <!-- Legend (Separate Line) -->
                    <div class="flex items-center space-x-6 text-gray-600 text-sm mb-2">
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-arrow-up text-green-500"></i>
                            <span>Production</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-arrow-down text-red-500"></i>
                            <span>Loss</span>
                        </div>
                    </div>


                    <!-- Standardized Date Filter -->
                    <div>
                        <VueDatePicker v-model="selectedDateRange" range :enable-time-picker="false"
                            :format="'MM/dd/yyyy'" :auto-apply="true" placeholder="Select date range"
                            menu-class-name="custom-date-picker"
                            class="custom-datepicker flex-1 text-gray-700 cursor-pointer" />
                    </div>

                    <!---- Download Button-->
                    <button @click="downloadData">
                        <div class="w-6 h-6 bg-black rounded-full flex items-center justify-center ml-2">
                            <i class="fa fa-download text-white text-sm"></i>
                        </div>
                    </button>
                </div>
            </div>


            <!-- Loading Spinner -->
            <div v-if="loading" class="flex justify-center items-center">
                <div class="animate-spin rounded-full h-10 w-10 border-t-4 border-gray-500"></div>
            </div>
            <div class="main-card-grid grid grid-cols-5 gap-2">

                <!-- Locations Section -->
                <div v-if="!loading && !showDepartments && !showEmployees" v-for="(location, index) in locations"
                    :key="index" @click="toggleLocationView(location.internalid.value)"
                    class="flex shadow-lg rounded-lg hover:shadow-sm hover:-translate-y-1 transition-all cursor-pointer p-1 items-center w-full bg-gray-200">

                    <!-- Left Icon Section -->
                    <div class="flex items-center justify-center w-10 h-full bg-gray-200">
                        <i class="fas fa-map-marker-alt text-gray-600 text-sm"></i>
                    </div>

                    <!-- Right Content Section -->
                    <div class="flex-1 pl-2 pr-2 py-2 bg-white rounded-r-lg border-2 border-white shadow-md">
                        <p class="text-xs font-semibold text-gray-700">{{ location.name.value }}</p>

                        <!-- Bag Count -->
                        <div class="bg-green-50 p-1 rounded mb-2 text-center">
                            <p class="text-[10px] font-semibold text-gray-700">No. of Bags: <span class="text-blue-600">{{ getLocationTotalBagCount(location) || 0 }}</span></p>
                        </div>

                        <div class="text-[11px] font-semibold w-full text-center bg-gray-100 rounded p-1 mb-1">Issued & Loss Quantity</div>

                        <div class="grid grid-cols-2 gap-y-0.5">
                            <!-- Gold Section -->
                            <div class="flex flex-col text-left">
                                <div class="flex items-center space-x-0.5">
                                    <i class="fas fa-ring text-gray-500 text-[9px]"></i>
                                    <span class="font-semibold text-gray-600 text-[11px]">Gold</span>
                                </div>
                                <span class="text-gray-700 text-[11px]">grams</span>
                                <div class="flex items-center space-x-0.5">
                                    <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                    <p class="text-green-500 text-[10px]">{{ (getLocationTotalIssuedQtyGold(location) || 0).toFixed(2) }}</p>
                                </div>
                                <div class="flex items-center space-x-0.5">
                                    <i class="fas fa-arrow-down text-red-500 text-[9px]"></i>
                                    <p class="text-red-500 text-[10px]">{{ (getLocationTotalLossQtyGold(location) || 0).toFixed(2) }}</p>
                                </div>
                            </div>

                            <!-- Diamond Section -->
                            <div class="flex flex-col">  
                                <div class="flex items-center space-x-0.5">
                                    <i class="fas fa-gem text-gray-500 text-[9px]"></i>
                                    <span class="font-semibold text-gray-600 text-[11px]">Diamond</span>
                                </div>
                                <div class="grid grid-cols-2 gap-x-1">
                                    <div class="flex flex-col items-center">
                                        <span class="text-gray-700 text-[11px]">carat</span>
                                        <div class="flex items-center space-x-0.5">
                                            <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                            <p class="text-green-500 text-[10px]">{{ (getLocationTotalIssuedQtyDiamond(location) || 0).toFixed(2) }}</p>
                                        </div>
                                        <div class="flex items-center space-x-0.5">
                                            <i class="fas fa-arrow-down text-red-500 text-[9px]"></i>
                                            <p class="text-red-500 text-[10px]">{{ (getLocationTotalLossQtyDiamond(location) || 0).toFixed(2) }}</p>
                                        </div>
                                    </div>
                                    <div class="flex flex-col items-right">
                                        <span class="text-gray-700 text-[11px]">pieces</span>
                                        <div class="flex items-center space-x-0.5">
                                            <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                            <p class="text-green-500 text-[10px]">{{ (getLocationTotalIssuedPiecesDiamond(location) || 0).toFixed(2) }}</p>
                                        </div>
                                        <div class="flex items-center space-x-0.5">
                                            <i class="fas fa-arrow-down text-red-500 text-[9px]"></i>
                                            <p class="text-red-500 text-[10px]">{{ (getLocationTotalLossPiecesDiamond(location) || 0).toFixed(2) }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="text-[11px] font-semibold w-full text-center bg-gray-100 rounded p-1 mb-1 mt-1">Actual Production and Loss</div>
                        <!-- Actual Production and Loss Section -->
                        <div class="grid grid-cols-2 gap-y-1">
                            <!-- Actual Gold Section -->
                            <div class="flex flex-col text-left">
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-ring text-gray-500 text-[9px]"></i>
                                    <span class="text-[11px] font-semibold text-gray-600">Gold</span>
                                </div>
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                    <p class="text-green-500 text-[10px]">{{ (getLocationTotalActualProductionGold(location) || 0).toFixed(2) }}</p>
                                </div>
                            </div>

                            <!-- Actual Diamond Section -->
                            <div class="flex flex-col">
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-gem text-gray-500 text-[9px]"></i>
                                    <span class="text-[11px] font-semibold text-gray-600">Diamond</span>
                                </div>
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                    <p class="text-green-500 text-[10px]">{{ (getLocationTotalActualProductionDiamond(location) || 0).toFixed(2) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Departments Section -->
                <div v-if="!loading && showDepartments && !showEmployees" v-for="(dept, index) in selectedDepartments"
                    :key="index" @click="toggleDepartmentView(dept.name)"
                    class="flex shadow-lg rounded-lg hover:shadow-sm hover:-translate-y-1 transition-all cursor-pointer p-1 items-center w-full bg-gray-200">

                    <!-- Left Icon Section -->
                    <div class="flex items-center justify-center w-10 h-full bg-gray-200">
                        <i class="fa fa-archive text-gray-600 text-sm"></i>
                    </div>

                    <!-- Right Content Section -->
                    <div class="flex-1 pl-2 pr-2 py-2 bg-white rounded-r-lg border-2 border-white shadow-md">
                        <p class="text-sm font-semibold text-gray-700 mb-2">{{ dept.name }}</p>

                        <!-- Bag Count -->
                        <div class="bg-green-50 p-1 rounded mb-2 text-center">
                            <p class="text-[10px] font-semibold text-gray-700">No. of Bags: <span class="text-blue-600">{{ dept.bag_count || 0 }}</span></p>
                        </div>

                        <div class="text-[11px] font-semibold w-full text-center bg-gray-100 rounded p-1 mb-1">Issued & Loss Quantity</div>

                        <div class="grid grid-cols-2 mt-1 gap-y-1">
                            <!-- Gold Section -->
                            <div class="flex flex-col text-left">
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-ring text-gray-500 text-[9px]"></i>
                                    <span class="text-[11px] font-semibold text-gray-600">Gold</span>
                                </div>
                                <span class="text-[11px] text-gray-700 mt-1">grams</span>
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                    <p class="text-green-500 text-[10px]">{{ (getDepartmentTotalIssuedQtyGold(dept) || 0).toFixed(2) }}</p>
                                </div>
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-arrow-down text-red-500 text-[9px]"></i>
                                    <p class="text-red-500 text-[10px]">{{ (getDepartmentTotalLossQtyGold(dept) || 0).toFixed(2) }}</p>
                                </div>
                            </div>

                            <!-- Diamond Section -->
                            <div class="flex flex-col">
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-gem text-gray-500 text-[9px]"></i>
                                    <span class="text-[11px] font-semibold text-gray-600">Diamond</span>
                                </div>
                                <div class="grid grid-cols-2 gap-x-2 mt-1">
                                    <!-- Diamond Carat Section -->
                                    <div class="flex flex-col items-center">
                                        <span class="text-[11px] text-gray-700">carat</span>
                                        <div class="flex items-center space-x-1">
                                            <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                            <p class="text-green-500 text-[10px]">{{ (getDepartmentTotalIssuedQtyDiamond(dept) || 0).toFixed(2) }}</p>
                                        </div>
                                        <div class="flex items-center space-x-1">
                                            <i class="fas fa-arrow-down text-red-500 text-[9px]"></i>
                                            <p class="text-red-500 text-[10px]">{{ (getDepartmentTotalLossQtyDiamond(dept) || 0).toFixed(2) }}</p>
                                        </div>
                                    </div>

                                    <!-- Diamond Pieces Section -->
                                    <div class="flex flex-col items-right">
                                        <span class="text-[11px] text-gray-700">pieces</span>
                                        <div class="flex items-center space-x-1">
                                            <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                            <p class="text-green-500 text-[10px]">{{ (getDepartmentTotalIssuedPiecesDiamond(dept) || 0).toFixed(2) }}</p>
                                        </div>
                                        <div class="flex items-center space-x-1">
                                            <i class="fas fa-arrow-down text-red-500 text-[9px]"></i>
                                            <p class="text-red-500 text-[10px]">{{ (getDepartmentTotalLossPiecesDiamond(dept) || 0).toFixed(2) }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="text-[11px] font-semibold w-full text-center bg-gray-100 rounded p-1 mb-1 mt-1">Actual Production and Loss</div>

                        <!-- Actual Production and Loss Section -->
                        <div class="grid grid-cols-2 gap-y-1">
                            <!-- Actual Gold Section -->
                            <div class="flex flex-col text-left">
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-ring text-gray-500 text-[9px]"></i>
                                    <span class="text-[11px] font-semibold text-gray-600">Gold</span>
                                </div>
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                    <p class="text-green-500 text-[10px]">{{ (getDepartmentTotalActualProductionGold(dept) || 0).toFixed(2) }}</p>
                                </div>
                            </div>

                            <!-- Actual Diamond Section -->
                            <div class="flex flex-col">
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-gem text-gray-500 text-[9px]"></i>
                                    <span class="text-[11px] font-semibold text-gray-600">Diamond</span>
                                </div>
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                    <p class="text-green-500 text-[10px]">{{ (getDepartmentTotalActualProductionDiamond(dept) || 0).toFixed(2) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Employees Section -->
                <div v-if="!loading && showEmployees" v-for="(emp, index) in selectedEmployees" :key="index"
                    class="flex shadow-lg rounded-lg hover:shadow-sm hover:-translate-y-1 transition-all cursor-pointer p-1 items-center w-full bg-gray-200">

                    <!-- Left Icon Section -->
                    <div class="flex items-center justify-center w-10 h-full bg-gray-200">
                        <i class="fas fa-user text-gray-600 text-sm"></i>
                    </div>

                    <!-- Right Content Section -->
                    <div class="flex-1 pl-2 pr-2 py-2 bg-white rounded-r-lg border-2 border-white shadow-md">
                        <p class="text-sm font-semibold text-gray-700">{{ emp.name }}</p>

                        <!-- Bag Count -->
                        <div class="bg-green-50 p-1 rounded mb-2 text-center">
                            <p class="text-[10px] font-semibold text-gray-700">No. of Bags: <span class="text-blue-600">{{ emp.bag_count || 0 }}</span></p>
                        </div>

                        <div class="text-[11px] font-semibold w-full text-center bg-gray-100 rounded p-1 mb-1">Issued & Loss Quantity</div>

                        <div class="grid grid-cols-2 mt-1 gap-y-1">
                            <!-- Gold Section -->
                            <div class="flex flex-col text-left">
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-ring text-gray-500 text-[9px]"></i>
                                    <span class="text-[11px] font-semibold text-gray-600">Gold</span>
                                </div>
                                <span class="text-[11px] text-gray-700 mt-1">grams</span>
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                    <p class="text-green-500 text-[10px]">{{ (getEmployeeTotalIssuedQtyGold(emp) || 0).toFixed(2) }}</p>
                                </div>
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-arrow-down text-red-500 text-[9px]"></i>
                                    <p class="text-red-500 text-[10px]">{{ (getEmployeeTotalLossQtyGold(emp) || 0).toFixed(2) }}</p>
                                </div>
                            </div>

                            <!-- Diamond Section -->
                            <div class="flex flex-col">
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-gem text-gray-500 text-[9px]"></i>
                                    <span class="text-[11px] font-semibold text-gray-600">Diamond</span>
                                </div>
                                <div class="grid grid-cols-2 gap-x-2 mt-1">
                                    <!-- Diamond Carat Section -->
                                    <div class="flex flex-col items-center">
                                        <span class="text-[11px] text-gray-700">carat</span>
                                        <div class="flex items-center space-x-1">
                                            <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                            <p class="text-green-500 text-[10px]">{{ (getEmployeeTotalIssuedQtyDiamond(emp) || 0).toFixed(2) }}</p>
                                        </div>
                                        <div class="flex items-center space-x-1">
                                            <i class="fas fa-arrow-down text-red-500 text-[9px]"></i>
                                            <p class="text-red-500 text-[10px]">{{ (getEmployeeTotalLossQtyDiamond(emp) || 0).toFixed(2) }}</p>
                                        </div>
                                    </div>

                                    <!-- Diamond Pieces Section -->
                                    <div class="flex flex-col items-right">
                                        <span class="text-[11px] text-gray-700">pieces</span>
                                        <div class="flex items-center space-x-1">
                                            <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                            <p class="text-green-500 text-[10px]">{{ (getEmployeeTotalIssuedPiecesDiamond(emp) || 0).toFixed(2) }}</p>
                                        </div>
                                        <div class="flex items-center space-x-1">
                                            <i class="fas fa-arrow-down text-red-500 text-[9px]"></i>
                                            <p class="text-red-500 text-[10px]">{{ (getEmployeeTotalLossPiecesDiamond(emp) || 0).toFixed(2) }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="text-[11px] font-semibold w-full text-center bg-gray-100 rounded p-1 mb-1 mt-1">Actual Production and Loss</div>

                        <!-- Actual Production Section -->
                        <div class="grid grid-cols-2 gap-y-1">
                            <!-- Actual Gold Section -->
                            <div class="flex flex-col text-left">
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-ring text-gray-500 text-[9px]"></i>
                                    <span class="text-[11px] font-semibold text-gray-600">Gold</span>
                                </div>
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                    <p class="text-green-500 text-[10px]">{{ (getEmployeeTotalActualProductionGold(emp) || 0).toFixed(2) }}</p>
                                </div>
                            </div>

                            <!-- Actual Diamond Section -->
                            <div class="flex flex-col">
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-gem text-gray-500 text-[9px]"></i>
                                    <span class="text-[11px] font-semibold text-gray-600">Diamond</span>
                                </div>
                                <div class="flex items-center space-x-1">
                                    <i class="fas fa-arrow-up text-green-500 text-[9px]"></i>
                                    <p class="text-green-500 text-[10px]">{{ (getEmployeeTotalActualProductionDiamond(emp) || 0).toFixed(2) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <!-- Table Section -->
            <div v-if="showTable" class="bg-white p-3 rounded-lg shadow mt-4">
                <h2 class="text-md font-bold mb-1 text-gray-700">
                    {{ showEmployeesTable ? 'Employee Details' : 'Department Details' }}
                </h2>
                <div class="table-container overflow-x-auto">
                    <table class="w-full border-collapse border border-gray-200 text-[10px]"> <!-- Reduced text size -->
                        <thead class="bg-gray-100 text-gray-600 uppercase text-[11px]">
                            <tr>
                                <th class="px-3 py-2 text-left font-semibold">#</th>
                                <th class="px-3 py-2 text-left font-semibold">
                                    {{ showEmployeesTable ? 'Names' : 'Department' }}
                                </th>
                                <!-- <th class="px-3 py-2 text-left font-semibold">Dates</th> -->
                                <th class="px-3 py-2 text-left font-semibold">No. of Bags</th>
                                <th class="px-3 py-2 text-left font-semibold">Item category</th>
                                <th class="px-3 py-2 text-left font-semibold">Style Number</th>
                                <th class="px-3 py-2 text-left font-semibold">Bags</th>

                                <th class="px-3 py-2 text-left font-semibold">TM Production Gold</th>
                                <!-- <th class="px-3 py-2 text-left font-semibold">Issued Qty Gold</th> -->
                                <th class="px-3 py-2 text-left font-semibold">Actual Production Gold</th>
                                <th class="px-3 py-2 text-left font-semibold">Loss Qty Gold</th>
                                <!-- <th class="px-3 py-2 text-left font-semibold">Scrap Qty Gold</th>
                                <th class="px-3 py-2 text-left font-semibold">Balance Qty Gold</th> -->
                                <th class="px-3 py-2 text-left font-semibold">Gold Loss %</th>

                                <th class="px-3 py-2 text-left font-semibold">TM Production Diamond</th>
                                <!-- <th class="px-3 py-2 text-left font-semibold">Issued Qty Diamond</th> -->
                                <th class="px-3 py-2 text-left font-semibold">Actual Production Diamond</th>
                                <th class="px-3 py-2 text-left font-semibold">Loss Qty Diamond</th>
                                <!-- <th class="px-3 py-2 text-left font-semibold">Scrap Qty Diamond</th>
                                <th class="px-3 py-2 text-left font-semibold">Balance Qty Diamond</th> -->
                                <th class="px-3 py-2 text-left font-semibold">Diamond Loss %</th>

                                <th class="px-3 py-2 text-left font-semibold">Gold Recovery Weight (gm)</th>
                                <th class="px-3 py-2 text-left font-semibold">Net Loss Gold</th>
                                <th class="px-3 py-2 text-left font-semibold">Diamond Recovery Weight (ct)</th>
                                <th class="px-3 py-2 text-left font-semibold">Net Loss Diamond</th>
                            </tr>
                        </thead>

                        <tbody class="text-gray-700">
                            <!-- Department Details with Categories -->
                            <template v-if="!showEmployeesTable" v-for="(dept, deptIndex) in selectedDepartmentData" :key="'dept-' + deptIndex">
                                <!-- If department has categories, show them with rowspan -->
                                <template v-if="dept.unique_categories_array && dept.unique_categories_array.length > 0">
                                    <tr v-for="(category, catIndex) in dept.unique_categories_array" :key="'dept-' + deptIndex + '-cat-' + catIndex" 
                                        class="border-b group hover:bg-gray-50 transition-all duration-200 text-[11px]">
                                        <!-- SL No - only show on first category row -->
                                        <td v-if="catIndex === 0" :rowspan="dept.unique_categories_array.length" class="px-3 py-2 group-hover:!bg-white border-r">{{ deptIndex + 1 }}</td>
                                        
                                        <!-- Department Name - only show on first category row -->
                                        <td v-if="catIndex === 0" :rowspan="dept.unique_categories_array.length" class="px-3 py-2 group-hover:!bg-white border-r">{{ dept.name }}</td>
                                        
                                        <!-- No. of Bags - only show on first category row -->
                                        <td v-if="catIndex === 0" :rowspan="dept.unique_categories_array.length" class="px-3 py-2 font-semibold text-center bg-blue-50 border-r">{{ dept.bag_count || 0 }}</td>
                                        
                                        <!-- Item Category -->
                                        <td class="px-3 py-2 group-hover:shadow-md">{{ category || 'N/A' }}</td>

                                        <!-- Print Design (Assembly Item) -->
                                        <td class="px-3 py-2 group-hover:shadow-md">{{ dept.category_print_design_map?.[category] || '-' }}</td>

                                        <!-- Bags (per category) -->
                                        <td class="px-3 py-2 group-hover:shadow-md text-center bg-blue-50">{{ dept.category_bag_count_map?.[category] || 0 }}</td>

                                        <!-- Starting Qty Gold -->
                                        <td class="px-3 py-2 group-hover:shadow-md">{{ getCategoryStartingQty(dept, category) }}</td>
                                        
                                        <!-- Issued Qty Gold -->
                                        <!-- <td class="px-3 py-2 group-hover:shadow-md">{{ getCategoryIssuedQty(dept, category) }}</td> -->
                                        
                                        <!-- Actual Production Gold -->
                                        <td class="px-3 py-2 group-hover:shadow-md">{{ roundToTwo(getCategoryStartingQtyGoldRaw(dept, category) + getCategoryIssuedQtyGoldRaw(dept, category) - getCategoryLossQtyGoldRaw(dept, category) - getCategoryScrapQtyGoldRaw(dept, category) - getCategoryBalanceQtyGoldRaw(dept, category)) }}</td>
                                        
                                        <!-- Loss Qty Gold -->
                                        <td class="px-3 py-2 text-red-500 group-hover:shadow-md">{{ getCategoryLossQty(dept, category) }}</td>
                                        
                                        <!-- Scrap Qty Gold -->
                                        <!-- <td class="px-3 py-2 group-hover:shadow-md">{{ getCategoryScrapQty(dept, category) }}</td> -->
                                        
                                        <!-- Balance Qty Gold -->
                                        <!-- <td class="px-3 py-2 group-hover:shadow-md">{{ getCategoryBalanceQty(dept, category) }}</td> -->
                                        
                                        <!-- Gold Loss % -->
                                        <td class="px-3 py-2 text-red-500 group-hover:shadow-md">{{ roundToTwo(calculateGoldLossPercentage(getCategoryStartingQtyGoldRaw(dept, category), getCategoryIssuedQtyGoldRaw(dept, category), getCategoryLossQtyGoldRaw(dept, category), getCategoryScrapQtyGoldRaw(dept, category), getCategoryBalanceQtyGoldRaw(dept, category))) }}%</td>
                                        
                                        <!-- Starting Qty Diamond -->
                                        <td class="px-3 py-2 group-hover:shadow-md">{{ getCategoryStartingQtyDiamond(dept, category) }}</td>
                                        
                                        <!-- Issued Qty Diamond -->
                                        <!-- <td class="px-3 py-2 group-hover:shadow-md">{{ getCategoryIssuedQtyDiamond(dept, category) }}</td> -->
                                        
                                        <!-- Actual Production Diamond -->
                                        <td class="px-3 py-2 group-hover:shadow-md">{{ roundToTwo(getCategoryStartingQtyDiamondRaw(dept, category) + getCategoryIssuedQtyDiamondRaw(dept, category) - getCategoryLossQtyDiamondRaw(dept, category) - getCategoryScrapQtyDiamondRaw(dept, category) - getCategoryBalanceQtyDiamondRaw(dept, category)) }}</td>

                                        <!-- Loss Qty Diamond -->
                                        <td class="px-3 py-2 text-red-500 group-hover:shadow-md">{{ getCategoryLossQtyDiamond(dept, category) }}</td>
                                        
                                        <!-- Scrap Qty Diamond -->
                                        <!-- <td class="px-3 py-2 group-hover:shadow-md">{{ getCategoryScrapQtyDiamond(dept, category) }}</td> -->
                                        
                                        <!-- Balance Qty Diamond -->
                                        <!-- <td class="px-3 py-2 group-hover:shadow-md">{{ getCategoryBalanceQtyDiamond(dept, category) }}</td> -->
                                        
                                        <!-- Diamond Loss % -->
                                        <td class="px-3 py-2 text-red-500 group-hover:shadow-md">{{ roundToTwo(calculateDiamondLossPercentage(getCategoryStartingQtyDiamondRaw(dept, category), getCategoryIssuedQtyDiamondRaw(dept, category), getCategoryLossQtyDiamondRaw(dept, category), getCategoryScrapQtyDiamondRaw(dept, category), getCategoryBalanceQtyDiamondRaw(dept, category))) }}%</td>

                                        <!-- Gold Recovery Weight -->
                                        <td class="px-3 py-2 group-hover:shadow-md">-</td>
                                        
                                        <!-- Net Loss Gold -->
                                        <td class="px-3 py-2 text-red-500 group-hover:shadow-md">-</td>
                                        
                                        <!-- Diamond Recovery Weight -->
                                        <td class="px-3 py-2 group-hover:shadow-md">-</td>
                                        
                                        <!-- Net Loss Diamond -->
                                        <td class="px-3 py-2 group-hover:shadow-md">-</td>
                                    </tr>
                                </template>
                            </template>

                            <!-- Total Row for Departments -->
                            <tr v-if="!showEmployeesTable" class="bg-gray-100 font-bold border-t text-[11px]">
                                <td class="px-3 py-2" colspan="2" style="text-align: center;">Total</td>

                                <!-- Total No. of Bags -->
                                <td class="px-3 py-2 font-semibold text-center bg-blue-50">{{ totalDeptBagCount }}</td>

                                <!-- Item Category (empty) -->
                                <td class="px-3 py-2 font-semibold"></td>

                                <!-- Print Design (empty) -->
                                <td class="px-3 py-2 font-semibold"></td>

                                <!-- Bags (empty) -->
                                <td class="px-3 py-2 font-semibold"></td>

                                <!-- Starting Qty Gold -->
                                <td class="px-3 py-2">{{ totalDeptStartingQuantityGold }}</td>

                                <!-- Issued Qty Gold -->
                                <!-- <td class="px-3 py-2">{{ totalDeptIssuedQtyGold }}</td> -->

                                <!-- Actual Production Gold -->
                                <td class="px-3 py-2">{{ totalDeptActualProductionGold }}</td>

                                <!-- Loss Gold -->
                                <td class="px-3 py-2 text-red-500">{{ totalDeptLossQtyGold }}</td>
                                
                                <!-- <td class="px-3 py-2 text-red-500"></td> -->
                                <!-- <td class="px-3 py-2 text-red-500"></td> -->
                                <td class="px-3 py-2 text-red-500"></td>
                                
                                <!-- Starting Qty Diamond -->
                                <td class="px-3 py-2">{{ totalDeptStartingQuantityDiamond }}</td>
                                
                                <!-- Issued Qty Diamond -->
                                <!-- <td class="px-3 py-2">{{ totalDeptIssuedQtyDiamond }}</td> -->
                                
                                <!-- Actual Production Diamond -->
                                <td class="px-3 py-2">{{ totalDeptActualProductionDiamond }}</td>
                                
                                <!-- Loss Diamond -->
                                <td class="px-3 py-2 text-red-500">{{ totalDeptLossQtyDiamond }}</td>
                                
                                <!-- <td class="px-3 py-2 text-red-500"></td> -->
                                <!-- <td class="px-3 py-2 text-red-500"></td> -->
                                <td class="px-3 py-2 text-red-500"></td>
                                
                                <!-- Gold Recovery Weight -->
                                <td class="px-3 py-2"></td>

                                <!-- Net Loss Gold -->
                                <td class="px-3 py-2 text-red-500"></td>

                                <!-- Diamond Recovery Weight -->
                                <td class="px-3 py-2"></td>

                                <!-- Net Loss Diamond -->
                                <td class="px-3 py-2 text-red-500"></td>
                            </tr>
                        </tbody>

                        <!-- Employee Details -->
                        <tbody class="text-gray-700">
                            <template v-if="showEmployeesTable" v-for="(emp, empIndex) in selectedEmployees" :key="'emp-' + empIndex">
                                <!-- Employee row with categories -->
                                <template v-if="emp.unique_categories_array && emp.unique_categories_array.length > 0">
                                    <template v-for="(category, catIndex) in emp.unique_categories_array" :key="'emp-' + empIndex + '-cat-' + catIndex">
                                        <tr class="border-b group hover:bg-gray-50 transition-all duration-200 text-[11px]">
                                            <!-- SL No (rowspan for first category row) -->
                                            <td v-if="catIndex === 0" :rowspan="emp.unique_categories_array.length" class="px-3 py-2 group-hover:!bg-white">{{ empIndex + 1 }}</td>
                                            
                                            <!-- Employee Name (rowspan for first category row) -->
                                            <td v-if="catIndex === 0" :rowspan="emp.unique_categories_array.length" class="px-3 py-2 group-hover:!bg-white">{{ emp.name }}</td>
                                            
                                            <!-- No. of Bags (rowspan for first category row) -->
                                            <td v-if="catIndex === 0" :rowspan="emp.unique_categories_array.length" class="px-3 py-2 font-semibold text-center bg-blue-50">{{ emp.bag_count || 0 }}</td>
                                            
                                            <!-- Item Category -->
                                            <td class="px-3 py-2 group-hover:shadow-md">{{ category || 'N/A' }}</td>
                                            
                                            <!-- Print Design (Assembly Item) -->
                                            <td class="px-3 py-2 group-hover:shadow-md">{{ emp.category_print_design_map?.[category] || '-' }}</td>
                                            
                                            <!-- Bags (per category) -->
                                            <td class="px-3 py-2 group-hover:shadow-md text-center bg-blue-50">{{ emp.category_bag_count_map?.[category] || 0 }}</td>
                                            
                                            <!-- Starting Qty Gold -->
                                            <td class="px-3 py-2 group-hover:shadow-md">{{ getEmployeeCategoryStartingQtyGold(emp, category) }}</td>
                                            
                                            <!-- Issued Qty Gold -->
                                            <!-- <td class="px-3 py-2 group-hover:shadow-md">{{ getEmployeeCategoryIssuedQtyGold(emp, category) }}</td> -->
                                            
                                            <!-- Actual Production Gold -->
                                            <td class="px-3 py-2 group-hover:shadow-md">{{ roundToTwo(getEmployeeCategoryStartingQtyGoldRaw(emp, category) + getEmployeeCategoryIssuedQtyGoldRaw(emp, category) - getEmployeeCategoryLossQtyGoldRaw(emp, category) - getEmployeeCategoryScrapQtyGoldRaw(emp, category) - getEmployeeCategoryBalanceQtyGoldRaw(emp, category)) }}</td>

                                            <!-- Loss Qty Gold -->
                                            <td class="px-3 py-2 text-red-500 group-hover:shadow-md">{{ getEmployeeCategoryLossQtyGold(emp, category) }}</td>
                                            
                                            <!-- Scrap Qty Gold -->
                                            <!-- <td class="px-3 py-2 group-hover:shadow-md">{{ getEmployeeCategoryScrapQtyGold(emp, category) }}</td> -->
                                            
                                            <!-- Balance Qty Gold -->
                                            <!-- <td class="px-3 py-2 group-hover:shadow-md">{{ getEmployeeCategoryBalanceQtyGold(emp, category) }}</td> -->
                                            
                                            <!-- Gold Loss % -->
                                            <td class="px-3 py-2 text-red-500 group-hover:shadow-md">{{ roundToTwo(calculateGoldLossPercentage(getEmployeeCategoryStartingQtyGoldRaw(emp, category), getEmployeeCategoryIssuedQtyGoldRaw(emp, category), getEmployeeCategoryLossQtyGoldRaw(emp, category), getEmployeeCategoryScrapQtyGoldRaw(emp, category), getEmployeeCategoryBalanceQtyGoldRaw(emp, category))) }}%</td>
                                            
                                            <!-- Starting Qty Diamond -->
                                            <td class="px-3 py-2 group-hover:shadow-md">{{ getEmployeeCategoryStartingQtyDiamond(emp, category) }}</td>

                                            <!-- Issued Qty Diamond -->
                                            <!-- <td class="px-3 py-2 group-hover:shadow-md">{{ getEmployeeCategoryIssuedQtyDiamond(emp, category) }}</td> -->
                                            
                                            <!-- Actual Production Diamond -->
                                            <td class="px-3 py-2 group-hover:shadow-md">{{ roundToTwo(getEmployeeCategoryStartingQtyDiamondRaw(emp, category) + getEmployeeCategoryIssuedQtyDiamondRaw(emp, category) - getEmployeeCategoryLossQtyDiamondRaw(emp, category) - getEmployeeCategoryScrapQtyDiamondRaw(emp, category) - getEmployeeCategoryBalanceQtyDiamondRaw(emp, category)) }}</td>
                                            
                                            <!-- Loss Qty Diamond -->
                                            <td class="px-3 py-2 text-red-500 group-hover:shadow-md">{{ getEmployeeCategoryLossQtyDiamond(emp, category) }}</td>
                                            
                                            <!-- Scrap Qty Diamond -->
                                            <!-- <td class="px-3 py-2 group-hover:shadow-md">{{ getEmployeeCategoryScrapQtyDiamond(emp, category) }}</td> -->
                                            
                                            <!-- Balance Qty Diamond -->
                                            <!-- <td class="px-3 py-2 group-hover:shadow-md">{{ getEmployeeCategoryBalanceQtyDiamond(emp, category) }}</td> -->
                                            
                                            <!-- Diamond Loss % -->
                                            <td class="px-3 py-2 text-red-500 group-hover:shadow-md">{{ roundToTwo(calculateDiamondLossPercentage(getEmployeeCategoryStartingQtyDiamondRaw(emp, category), getEmployeeCategoryIssuedQtyDiamondRaw(emp, category), getEmployeeCategoryLossQtyDiamondRaw(emp, category), getEmployeeCategoryScrapQtyDiamondRaw(emp, category), getEmployeeCategoryBalanceQtyDiamondRaw(emp, category))) }}%</td>
                                            
                                            <!-- Gold Recovery Weight -->
                                            <td class="px-3 py-2 group-hover:shadow-md">-</td>
                                            
                                            <!-- Net Loss Gold -->
                                            <td class="px-3 py-2 text-red-500 group-hover:shadow-md">-</td>
                                            
                                            <!-- Diamond Recovery Weight -->
                                            <td class="px-3 py-2 group-hover:shadow-md">-</td>
                                            
                                            <!-- Net Loss Diamond -->
                                            <td class="px-3 py-2 group-hover:shadow-md">-</td>
                                        </tr>
                                    </template>
                                </template>
                            </template>

                            <!-- No data found row when selectedEmployees is empty -->
                            <tr v-if="showEmployeesTable && selectedEmployees.length === 0" class="border-b group hover:bg-gray-50 transition-all duration-200 text-[11px]">
                                <td colspan="16" style="text-align: center;" class="px-3 py-2 text-gray-900 italic">No data found for this Employee</td>
                            </tr>

                            <!-- Total Row for Employees -->
                            <tr v-if="showEmployeesTable" class="bg-gray-100 font-bold border-t text-[11px]">
                                <td class="px-3 py-2" colspan="2" style="text-align: center;">Total</td>

                                <!-- Total No. of Bags -->
                                <td class="px-3 py-2 font-semibold text-center bg-blue-50">{{ totalEmpBagCount }}</td>
                                
                                <!-- Item Category (empty) -->
                                <td class="px-3 py-2"></td>

                                <!-- Print Design (empty) -->
                                <td class="px-3 py-2"></td>

                                <!-- Bags (empty) -->
                                <td class="px-3 py-2"></td>

                                <!-- Starting Qty Gold -->
                                <td class="px-3 py-2">{{ totalEmpStartingQuantityGold }}</td>

                                <!-- Issued Qty Gold -->
                                <!-- <td class="px-3 py-2">{{ totalEmpIssuedQuantityGold }}</td> -->
                                
                                <!-- Actual Production Gold -->
                                <td class="px-3 py-2">{{ totalEmpActualProductionGoldCalculated }}</td>
                                
                                <!-- Loss Qty Gold -->
                                <td class="px-3 py-2 text-red-500">{{ totalEmpLossQuantityGold }}</td>
                                
                                
                                <!-- <td class="px-3 py-2 text-red-500"></td> -->
                                <!-- <td class="px-3 py-2 text-red-500"></td> -->
                                <td class="px-3 py-2 text-red-500"></td>

                                <!-- Starting Qty Diamond -->
                                <td class="px-3 py-2">{{ totalEmpStartingQuantityDiamond }}</td>

                                <!-- Issued Qty Diamond -->
                                <!-- <td class="px-3 py-2">{{ totalEmpIssuedQuantityDiamond }}</td> -->
                                
                                <!-- Actual Production Diamond -->
                                <td class="px-3 py-2">{{ totalEmpActualProductionDiamondCalculated }}</td>

                                <!-- Loss Qty Diamond -->
                                <td class="px-3 py-2 text-red-500">{{ totalEmpLossQuantityDiamond }}</td>

                                
                                <!-- <td class="px-3 py-2 text-red-500"></td> -->
                                <!-- <td class="px-3 py-2 text-red-500"></td> -->
                                <td class="px-3 py-2 text-red-500"></td>

                                <!-- Gold Recovery Weight -->
                                <td class="px-3 py-2"></td>

                                <!-- Net Loss Gold -->
                                <td class="px-3 py-2 text-red-500"></td>
                                
                                <!-- Diamond Recovery Weight -->
                                <td class="px-3 py-2"></td>

                                <!-- Net Loss Diamond -->
                                <td class="px-3 py-2 text-red-500"></td>
                            </tr>
                        </tbody>

                    </table>
                </div>
            </div>
            <!-- Chart & Production Section -->
            <div class="grid grid-cols-2 gap-4 mt-4">
                <!-- Production Chart -->
                <div class="p-4 rounded-lg shadow w-full h-72 flex flex-col justify-center 
                transition-all duration-300 hover:shadow-xl hover:scale-100 cursor-pointer">
                    <h2 class="text-md font-bold mb-2 text-center">Production</h2>
                    <div class="flex justify-center items-center w-full h-full">
                        <canvas id="productionChart"></canvas>
                    </div>
                </div>
                <div class="p-4 rounded-lg shadow w-full h-72 flex flex-col justify-center 
                         transition-all duration-300 hover:shadow-xl hover:scale-100 cursor-pointer">

                    <h2 class="text-md font-bold mb-2 text-center">
                        {{ dashboardTitle }}
                    </h2>
                    <div class="flex justify-center items-center w-full h-full">
                        <canvas id="cryptoChart"></canvas>
                    </div>
                </div>

            </div>
        </main>
    </div>
</template>

<script>
import { onMounted, ref, watch, computed } from 'vue';
import Chart from 'chart.js/auto';
import { useAllEfficiencyAnalysisApi } from "@/composables/reports-api/efficiency-analysis-api/FetchEfficiencyAnalysisApi";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default {
    components: {
        VueDatePicker,
    },
    props: {
        type: {
            type: String,
            default: 'overall', // 'overall' or 'repair'
        }
    },
    setup(props) {

        const expandedLocation = ref(null);
        const expandedDepartment = ref(null);
        const showDepartments = ref(false);
        const showEmployees = ref(false);
        const selectedDateRange = ref(null); // Holds selected date range
        const baseTitle = props.type === 'repair' ? "Repair Efficiency Analysis" : "Location Efficiency Analysis";
        const dashboardTitle = ref(baseTitle);
        const selectedDepartments = ref([]);
        const selectedEmployees = ref([]);
        const showTable = ref(false);
        const selectedDepartmentData = ref([]);
        const showEmployeesTable = ref(false);
        const showNoDataMessage = ref(false); // Show message if no data is available after retries

        let cryptoChart = null;
        let productionChart = null;
        const {
            loading,
            loadingComponents,
            error,
            fetchlistLocations,
            listLocationsData,
            listEfficiencyData,
            fetchListEfficiencyAnalysis,
            fetchInventoryAdjustments,
            listInventoryAdjustments

        } = useAllEfficiencyAnalysisApi();
        
        const to = ref(false); // ✅ Controls the visibility of the popup
        const locations = ref([]);
        const isInitialLoading = ref(true);
        const showNoDataPopup = ref(false); // ✅ Define showNoDataPopup as a reactive variable

        // Function to get the start of the current month and today’s date
        // const getDefaultDateRange = () => {
        //     const today = new Date();
        //     const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        //     return [firstDayOfMonth, today]; // Returns the range [start of month, today]
        // };
        const getDefaultDateRange = () => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            // return [yesterday, yesterday]; // Returns range: [yesterday, yesterday]
            return [today, today]; // Returns range: [today, today]
        };
        selectedDateRange.value = getDefaultDateRange(); // Initialize with today's date range
        const getDefaultDateRangeLast = () => {
            const today = new Date();

            // Subtract 1 year from today's date
            const lastYear = today.getFullYear() - 1;

            // Get the first day of the month, one year ago
            const firstDayOfLastYearMonth = new Date(lastYear, today.getMonth(), 1);

            // If today is the first day of the month, return the last day of the previous month from last year
            if (today.getDate() === 1) {
                const lastDayPrevMonth = new Date(lastYear, today.getMonth(), 0);
                return [lastDayPrevMonth, today]; // Returns range: [last day of previous month, today]
            }

            return [firstDayOfLastYearMonth, today]; // Normal case
        };


        // Compute Department Table Totals (sum all rows in table)
        const totalDeptStartingQuantityGold = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                if (dept.category_qty_map) {
                    Object.keys(dept.category_qty_map).forEach(key => {
                        if (key.startsWith(`${dept.id}_`)) {
                            const catData = dept.category_qty_map[key];
                            sum += parseFloat(catData.starting_qty_gold || 0);
                        }
                    });
                }
            });
            return roundToTwo(sum);
        });

        const totalDeptStartingQuantityDiamond = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                if (dept.category_qty_map) {
                    Object.keys(dept.category_qty_map).forEach(key => {
                        if (key.startsWith(`${dept.id}_`)) {
                            const catData = dept.category_qty_map[key];
                            sum += parseFloat(catData.starting_qty_diamond || 0);
                        }
                    });
                }
            });
            return roundToTwo(sum);
        });

        const totalDeptActualProductionGold = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                if (dept.category_qty_map) {
                    Object.keys(dept.category_qty_map).forEach(key => {
                        if (key.startsWith(`${dept.id}_`)) {
                            const catData = dept.category_qty_map[key];
                            const actualProduction = (parseFloat(catData.starting_qty_gold || 0) + parseFloat(catData.issued_qty_gold || 0) - parseFloat(catData.loss_qty_gold || 0) - parseFloat(catData.scrap_qty_gold || 0) - parseFloat(catData.balance_qty_gold || 0));
                            sum += actualProduction;
                        }
                    });
                }
            });
            return roundToTwo(sum);
        });

        const totalDeptGrossLossGold = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                sum += parseFloat(dept.loss || 0);
            });
            return roundToTwo(sum);
        });

        const totalDeptActualProductionDiamond = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                if (dept.category_qty_map) {
                    Object.keys(dept.category_qty_map).forEach(key => {
                        if (key.startsWith(`${dept.id}_`)) {
                            const catData = dept.category_qty_map[key];
                            const actualProduction = (parseFloat(catData.starting_qty_diamond || 0) + parseFloat(catData.issued_qty_diamond || 0) - parseFloat(catData.loss_qty_diamond || 0) - parseFloat(catData.scrap_qty_diamond || 0) - parseFloat(catData.balance_qty_diamond || 0));
                            sum += actualProduction;
                        }
                    });
                }
            });
            return roundToTwo(sum);
        });

        const totalDeptGrossLossDiamond = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                sum += parseFloat(dept.loss_diamond || 0);
            });
            return roundToTwo(sum);
        });

        const totalDeptGoldRecoveryWeight = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                sum += parseFloat(dept.totalWeightGold || 0);
            });
            return roundToTwo(sum);
        });

        const totalDeptNetLossGold = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                sum += parseFloat(dept.netLoss || 0);
            });
            return roundToTwo(sum);
        });

        const totalDeptTmProductionGold = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                sum += parseFloat(dept.production || 0);
            });
            return roundToTwo(sum);
        });

        const totalDeptTmProductionDiamond = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                sum += parseFloat(dept.production_diamond || 0);
            });
            return roundToTwo(sum);
        });

        const totalDeptBagCount = computed(() => {
            // Count unique bags across all departments
            const uniqueBags = new Set();
            selectedDepartmentData.value.forEach(dept => {
                if (dept.unique_bags_array && Array.isArray(dept.unique_bags_array)) {
                    dept.unique_bags_array.forEach(bag => uniqueBags.add(bag));
                }
            });
            // If no unique_bags_array, fallback to summing bag_count
            if (uniqueBags.size === 0) {
                let sum = 0;
                selectedDepartmentData.value.forEach(dept => {
                    sum += parseInt(dept.bag_count || 0);
                });
                return sum;
            }
            return uniqueBags.size;
        });

        const totalDeptIssuedQtyGold = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                sum += parseFloat(dept.issued_quantity_gold || 0);
            });
            return roundToTwo(sum);
        });

        const totalDeptLossQtyGold = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                if (dept.category_qty_map) {
                    Object.keys(dept.category_qty_map).forEach(key => {
                        if (key.startsWith(`${dept.id}_`)) {
                            const catData = dept.category_qty_map[key];
                            sum += parseFloat(catData.loss_qty_gold || 0);
                        }
                    });
                }
            });
            return roundToTwo(sum);
        });

        const totalDeptIssuedQtyDiamond = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                sum += parseFloat(dept.issued_quantity_diamond || 0);
            });
            return roundToTwo(sum);
        });

        const totalDeptLossQtyDiamond = computed(() => {
            let sum = 0;
            selectedDepartmentData.value.forEach(dept => {
                if (dept.category_qty_map) {
                    Object.keys(dept.category_qty_map).forEach(key => {
                        if (key.startsWith(`${dept.id}_`)) {
                            const catData = dept.category_qty_map[key];
                            sum += parseFloat(catData.loss_qty_diamond || 0);
                        }
                    });
                }
            });
            return roundToTwo(sum);
        });

        const totalEmpTmProductionGold = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                sum += parseFloat(emp.tmProduction || 0);
            });
            return roundToTwo(sum);
        });

        const totalEmpTmProductionDiamond = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                sum += parseFloat(emp.tmProductionDiamond || 0);
            });
            return roundToTwo(sum);
        });

        const totalEmpBagCount = computed(() => {
            // Count unique bags across all employees
            const uniqueBags = new Set();
            selectedEmployees.value.forEach(emp => {
                if (emp.unique_bags_array && Array.isArray(emp.unique_bags_array)) {
                    emp.unique_bags_array.forEach(bag => uniqueBags.add(bag));
                }
            });
            // If no unique_bags_array, fallback to summing bag_count
            if (uniqueBags.size === 0) {
                let sum = 0;
                selectedEmployees.value.forEach(emp => {
                    sum += parseInt(emp.bag_count || 0);
                });
                return sum;
            }
            return uniqueBags.size;
        });

        // Compute Employee Table Totals (sum all rows in table)
        const totalEmpActualProductionGold = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                sum += parseFloat(emp.actualProductionGold || 0);
            });
            return roundToTwo(sum);
        });

        const totalEmpGrossLossGold = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                sum += parseFloat(emp.grossLoss || 0);
            });
            return roundToTwo(sum);
        });

        const totalEmpActualProductionDiamond = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                sum += parseFloat(emp.actualProductionDiamond || 0);
            });
            return roundToTwo(sum);
        });

        const totalEmpGrossLossDiamond = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                sum += parseFloat(emp.grossLossDiamond || 0);
            });
            return roundToTwo(sum);
        });

        const totalEmpGoldRecoveryWeight = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                sum += parseFloat(emp.tmGrossLossWeight || 0);
            });
            return roundToTwo(sum);
        });

        const totalEmpNetLossGold = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                sum += parseFloat(emp.netLoss || 0);
            });
            return roundToTwo(sum);
        });

        const totalEmpStartingQuantityGold = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                if (emp.category_qty_map && emp.unique_categories_array) {
                    emp.unique_categories_array.forEach(category => {
                        const key = `${emp.id}_${category}`;
                        const data = emp.category_qty_map[key];
                        if (data) {
                            sum += parseFloat(data.starting_qty_gold || 0);
                        }
                    });
                } else {
                    sum += parseFloat(emp.starting_quantity_gold || 0);
                }
            });
            return roundToTwo(sum);
        });

        const totalEmpIssuedQuantityGold = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                if (emp.categories && emp.categories.length > 0) {
                    emp.categories.forEach(cat => {
                        sum += parseFloat(cat.issued_quantity_gold || 0);
                    });
                } else {
                    sum += parseFloat(emp.issued_quantity_gold || 0);
                }
            });
            return roundToTwo(sum);
        });

        const totalEmpLossQuantityGold = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                if (emp.category_qty_map && emp.unique_categories_array) {
                    emp.unique_categories_array.forEach(category => {
                        const key = `${emp.id}_${category}`;
                        const data = emp.category_qty_map[key];
                        if (data) {
                            sum += parseFloat(data.loss_qty_gold || 0);
                        }
                    });
                } else {
                    sum += parseFloat(emp.loss_quantity_gold || 0);
                }
            });
            return roundToTwo(sum);
        });

        const totalEmpStartingQuantityDiamond = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                if (emp.category_qty_map && emp.unique_categories_array) {
                    emp.unique_categories_array.forEach(category => {
                        const key = `${emp.id}_${category}`;
                        const data = emp.category_qty_map[key];
                        if (data) {
                            sum += parseFloat(data.starting_qty_diamond || 0);
                        }
                    });
                } else {
                    sum += parseFloat(emp.starting_quantity_diamond || 0);
                }
            });
            return roundToTwo(sum);
        });

        const totalEmpIssuedQuantityDiamond = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                if (emp.categories && emp.categories.length > 0) {
                    emp.categories.forEach(cat => {
                        sum += parseFloat(cat.issued_quantity_diamond || 0);
                    });
                } else {
                    sum += parseFloat(emp.issued_quantity_diamond || 0);
                }
            });
            return roundToTwo(sum);
        });

        const totalEmpLossQuantityDiamond = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                if (emp.category_qty_map && emp.unique_categories_array) {
                    emp.unique_categories_array.forEach(category => {
                        const key = `${emp.id}_${category}`;
                        const data = emp.category_qty_map[key];
                        if (data) {
                            sum += parseFloat(data.loss_qty_diamond || 0);
                        }
                    });
                } else {
                    sum += parseFloat(emp.loss_quantity_diamond || 0);
                }
            });
            return roundToTwo(sum);
        });

        const totalEmpActualProductionGoldCalculated = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                if (emp.category_qty_map && emp.unique_categories_array) {
                    emp.unique_categories_array.forEach(category => {
                        const key = `${emp.id}_${category}`;
                        const data = emp.category_qty_map[key];
                        if (data) {
                            const actualProd = (parseFloat(data.starting_qty_gold || 0) + parseFloat(data.issued_qty_gold || 0) - parseFloat(data.loss_qty_gold || 0) - parseFloat(data.scrap_qty_gold || 0) - parseFloat(data.balance_qty_gold || 0));
                            sum += actualProd;
                        }
                    });
                } else {
                    const actualProd = (parseFloat(emp.starting_quantity_gold || 0) + parseFloat(emp.issued_quantity_gold || 0) - parseFloat(emp.loss_quantity_gold || 0) - parseFloat(emp.scrap_quantity_gold || 0) - parseFloat(emp.balance_quantity_gold || 0));
                    sum += actualProd;
                }
            });
            return roundToTwo(sum);
        });

        const totalEmpActualProductionDiamondCalculated = computed(() => {
            let sum = 0;
            selectedEmployees.value.forEach(emp => {
                if (emp.category_qty_map && emp.unique_categories_array) {
                    emp.unique_categories_array.forEach(category => {
                        const key = `${emp.id}_${category}`;
                        const data = emp.category_qty_map[key];
                        if (data) {
                            const actualProd = (parseFloat(data.starting_qty_diamond || 0) + parseFloat(data.issued_qty_diamond || 0) - parseFloat(data.loss_qty_diamond || 0) - parseFloat(data.scrap_qty_diamond || 0) - parseFloat(data.balance_qty_diamond || 0));
                            sum += actualProd;
                        }
                    });
                } else {
                    const actualProd = (parseFloat(emp.starting_quantity_diamond || 0) + parseFloat(emp.issued_quantity_diamond || 0) - parseFloat(emp.loss_quantity_diamond || 0) - parseFloat(emp.scrap_quantity_diamond || 0) - parseFloat(emp.balance_quantity_diamond || 0));
                    sum += actualProd;
                }
            });
            return roundToTwo(sum);
        });

        // Function to format the name of locations, departments, and employees
        const formatName = (name) => {
            if (!name) return "";
            return name
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalizes the first letter of each word
        };

        // Helper function to calculate gold loss percentage using loss qty and actual production
        const calculateGoldLossPercentage = (startingGold, issuedGold, lossGold, scrapGold, balanceGold) => {
            const starting = startingGold || 0;
            const issued = issuedGold || 0;
            const loss = lossGold || 0;
            const scrap = scrapGold || 0;
            const balance = balanceGold || 0;
            
            // Calculate actual production: starting + issued - loss - scrap - balance
            const actualProduction = starting + issued - loss - scrap - balance;
            
            // If actual production is 0 or negative, return 0
            if (actualProduction <= 0) return 0;
            
            // Loss percentage = (loss / actual production) * 100
            return (loss / actualProduction) * 100;
        };

        // Helper function to calculate diamond loss percentage using loss qty and actual production
        const calculateDiamondLossPercentage = (startingDiamond, issuedDiamond, lossDiamond, scrapDiamond, balanceDiamond) => {
            const starting = startingDiamond || 0;
            const issued = issuedDiamond || 0;
            const loss = lossDiamond || 0;
            const scrap = scrapDiamond || 0;
            const balance = balanceDiamond || 0;
            
            // Calculate actual production: starting + issued - loss - scrap - balance
            const actualProduction = starting + issued - loss - scrap - balance;
            
            // If actual production is 0 or negative, return 0
            if (actualProduction <= 0) return 0;
            
            // Loss percentage = (loss / actual production) * 100
            return (loss / actualProduction) * 100;
        };

        // Set default date range on mount
        selectedDateRange.value = getDefaultDateRange();

        // fetchLocations function
        const fetchLocations = async () => {
            try {
                loading.value = true;
                isInitialLoading.value = true;
                await fetchlistLocations();
                if (listLocationsData.value) {
                    locations.value = listLocationsData.value.map(location => ({
                        internalid: { value: location.internalid.value },
                        name: { value: location.name.value },
                        production: "0", // Set default values
                        loss: "0",
                        departments: [] // Departments will be fetched dynamically
                    }));
                }
            } catch (err) {
                console.error("Error fetching locations:", err);
            } finally {
                loading.value = false;
                isInitialLoading.value = false;
            }
        };

        const fetchInventoryAdjustmentsDetails = async (startDate, endDate) => {
            try {
                loading.value = true;
                // Pass the dates to the API call if it expects them
                await fetchInventoryAdjustments(startDate, endDate);
            } catch (err) {
                console.error("Error fetching inventory Adjustment:", err);
            } finally {
                loading.value = false;
            }
        };
        // // download data function
        // const downloadData = () => {
        //     if (!listEfficiencyData.value || Object.keys(listEfficiencyData.value).length === 0) {
        //         alert("No data available for download.");
        //         return;
        //     }

        //     // ✅ Format the selected date range correctly
        //     const formatDate = (date) => {
        //         const offset = date.getTimezoneOffset();
        //         date = new Date(date.getTime() - (offset * 60 * 1000));
        //         return date.toISOString().split('T')[0];
        //     };

        //     const startDate = selectedDateRange.value[0] ? formatDate(selectedDateRange.value[0]) : "N/A";
        //     const endDate = selectedDateRange.value[1] ? formatDate(selectedDateRange.value[1]) : "N/A";

        //     // ✅ Retrieve Inventory Adjustments (Finding Recovery Weight Like `fetchEfficiencyAnalysisData`)
        //     let inventoryAdjustments = listInventoryAdjustments.value || [];
        //     console.log("Inventory Adjustments:", inventoryAdjustments);

        //     let departmentQuantities = {};
        //     let employeeQuantities = {}; // ✅ Store Department-Employee Key

        //     // **Process inventory adjustments to aggregate quantities by department & employee**
        //     inventoryAdjustments.forEach(item => {
        //         const departmentId = item.custbody_jj_recovery_department;
        //         const employeeId = item.custbody_jj_recovered_employee;
        //         const key = `${departmentId}_${employeeId}`; // ✅ Department-Specific Employee Key
        //         const quantity = parseFloat(item.quantity || 0);

        //         // Aggregate by department
        //         if (!departmentQuantities[departmentId]) {
        //             departmentQuantities[departmentId] = 0;
        //         }
        //         departmentQuantities[departmentId] += quantity;

        //         // Aggregate by department-employee key
        //         if (!employeeQuantities[key]) {
        //             employeeQuantities[key] = 0;
        //         }
        //         employeeQuantities[key] += quantity;
        //     });

        //     console.log("Aggregated Department Quantities:", departmentQuantities);
        //     console.log("Aggregated Employee Quantities:", employeeQuantities);

        //     // ✅ CSV Header
        //     let csvContent = `Efficiency Report\nDate Range: ${startDate} to ${endDate}\n\n`;
        //     csvContent += "Location, Department, Employee, TM Production Gold (g), Gross Loss Gold (g), TM Production Diamond (carat), Gross Loss Diamond (carat), TM Production Diamond (pieces), Gross Loss Diamond (pieces), Gold Recovery Weight (gm), Net Loss Gold, Diamond Recovery Weight (ct), Net Loss Diamond\n";

        //     Object.entries(listEfficiencyData.value).forEach(([locationId, location]) => {
        //         Object.entries(location.departments || {}).forEach(([deptId, department]) => {
        //             Object.entries(department.employees || {}).forEach(([empId, employee]) => {

        //                 // ✅ Find `tmGrossLossWeight` (Gold Recovery Weight) Using Department-Specific Key
        //                 const key = `${deptId}_${empId}`;
        //                 const goldRecoveryWeight = employeeQuantities[key] || 0;
        //                 const netLossGold = (parseFloat(employee.grossLoss || 0) - goldRecoveryWeight).toFixed(2);

        //                 csvContent += [
        //                     `"${location.location_name}"`,
        //                     `"${department.department_name}"`,
        //                     `"${employee.name}"`,
        //                     roundToTwo(employee.tmProduction || 0),
        //                     roundToTwo(employee.grossLoss || 0),
        //                     roundToTwo(employee.tmProductionDiamond || 0),
        //                     roundToTwo(employee.grossLossDiamond || 0),
        //                     roundToTwo(employee.tmProductionDiamondPieces || 0),
        //                     roundToTwo(employee.grossLossDiamondPieces || 0),
        //                     roundToTwo(goldRecoveryWeight),  // ✅ Department-Specific Gold Recovery Weight
        //                     roundToTwo(netLossGold),
        //                     roundToTwo(0),
        //                     roundToTwo(0)
        //                 ].join(",") + "\n";
        //             });

        //             // **🔸 Add Department Total Row**
        //             const totalGoldRecoveryWeight = departmentQuantities[deptId] || 0;
        //             const totalNetLossGold = (parseFloat(department.loss || 0) - totalGoldRecoveryWeight).toFixed(2);

        //             csvContent += [
        //                 `""`, // Separator Line
        //                 `"${department.department_name} (TOTAL)"`,
        //                 `""`, // Empty Employee column
        //                 roundToTwo(department.production || 0),
        //                 roundToTwo(department.loss || 0),
        //                 roundToTwo(department.production_diamond || 0),
        //                 roundToTwo(department.loss_diamond || 0),
        //                 roundToTwo(department.production_diamond_pieces || 0),
        //                 roundToTwo(department.loss_diamond_pieces || 0),
        //                 roundToTwo(totalGoldRecoveryWeight),
        //                 roundToTwo(totalNetLossGold),
        //                 roundToTwo(department.totalWeightDiamond || 0),
        //                 roundToTwo(department.netLossDiamond || 0)
        //             ].join(",") + "\n";
        //         });
        //     });

        //     // ✅ Generate and Download CSV File
        //     const timestamp = new Date().toISOString().replace(/[-T:]/g, "_").split(".")[0];
        //     const filename = `Efficiency_Report_${timestamp}.csv`;

        //     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        //     const url = URL.createObjectURL(blob);
        //     const link = document.createElement("a");
        //     link.setAttribute("href", url);
        //     link.setAttribute("download", filename);
        //     document.body.appendChild(link);
        //     link.click();
        //     document.body.removeChild(link);
        // };

        // download data function
        const downloadData = async () => {
            if (!locations.value || locations.value.length === 0) {
                alert("No data available for download.");
                return;
            }

            const formatDate = (date) => {
                const offset = date.getTimezoneOffset();
                date = new Date(date.getTime() - (offset * 60 * 1000));
                return date.toISOString().split('T')[0];
            };

            const startDate = selectedDateRange.value[0] ? formatDate(selectedDateRange.value[0]) : "N/A";
            const endDate = selectedDateRange.value[1] ? formatDate(selectedDateRange.value[1]) : "N/A";

            const workbook = new ExcelJS.Workbook();
            const ws = workbook.addWorksheet('Efficiency Report');

            // colour palette matching UI
            const C = {
                headerBg:   '1F2937', headerFg: 'FFFFFF',
                blueBg:     'DBEAFE', blueFg:   '1D4ED8',
                redFg:      'EF4444',
                subtotalBg: 'EFF6FF',   // very light blue — whole subtotal row
                grandBg:    'F0FDF4',   // very light green — whole grand total row
                rowBg:      'FFFFFF',   // white for all data rows
                borderColor:'D1D5DB',
            };
            const headerFont   = { bold: true, color: { argb: 'FF' + C.headerFg }, size: 10 };
            const boldFont     = { bold: true, size: 10 };
            const normalFont   = { size: 10 };
            const redFont      = { size: 10, color: { argb: 'FF' + C.redFg } };
            const blueBoldFont = { bold: true, size: 10, color: { argb: 'FF' + C.blueFg } };
            const thinBorder   = {
                top:   { style:'thin', color:{ argb:'FF'+C.borderColor } },
                left:  { style:'thin', color:{ argb:'FF'+C.borderColor } },
                bottom:{ style:'thin', color:{ argb:'FF'+C.borderColor } },
                right: { style:'thin', color:{ argb:'FF'+C.borderColor } },
            };
            const fillSolid = (hex) => ({ type:'pattern', pattern:'solid', fgColor:{ argb:'FF'+hex } });
            const styleRow  = (row, bg, font, colCount) => {
                for (let c = 1; c <= colCount; c++) {
                    const cell = row.getCell(c);
                    cell.fill      = fillSolid(bg);
                    cell.font      = { ...font };
                    cell.border    = thinBorder;
                    cell.alignment = { vertical:'middle', wrapText:true };
                }
            };
            const redCols = (row, cols) => cols.forEach(c => { row.getCell(c).font = { ...redFont }; });

            // Title
            ws.addRow([`Efficiency Report`]);
            ws.getRow(ws.rowCount).font = { bold:true, size:13 };
            ws.addRow([`Date Range: ${startDate} to ${endDate}`]);
            ws.getRow(ws.rowCount).font = { size:10, italic:true };
            ws.addRow([]);

            if (showEmployeesTable.value) {
                // ── EMPLOYEE TABLE ──────────────────────────────────────
                const EMP_HEADERS = [
                    'Location','Department','Employee','No. of Bags','Item Category','Print Design (Assembly Item)','Bags',
                    'TM Production Gold','Actual Production Gold','Loss Qty Gold','Gold Loss %',
                    'TM Production Diamond','Actual Production Diamond','Loss Qty Diamond','Diamond Loss %',
                    'Gold Recovery Weight (gm)','Net Loss Gold','Diamond Recovery Weight (ct)','Net Loss Diamond'
                ];
                const ECOL = EMP_HEADERS.length;
                const EMP_LOSS_COLS = [10,11,14,15,17,19];
                const ehRow = ws.addRow(EMP_HEADERS);
                styleRow(ehRow, C.headerBg, headerFont, ECOL);
                ehRow.height = 30;
                EMP_HEADERS.forEach((h, i) => { ws.getColumn(i+1).width = i===0?14:i<=4?16:18; });

                let gt = { sG:0,iG:0,lG:0,scG:0,bG:0, sD:0,iD:0,lD:0,scD:0,bD:0 };

                locations.value.forEach(loc => {
                    const locName = loc.name?.value || "";
                    let locShown = false;
                    (loc.departments || []).forEach(dept => {
                        const deptName = dept.name || "";
                        (dept.employees || []).forEach(emp => {
                            const empName  = emp.name || "";
                            const bagCount = emp.bag_count || 0;
                            const cats     = emp.unique_categories_array || [];
                            let sub = { sG:0,iG:0,lG:0,scG:0,bG:0, sD:0,iD:0,lD:0,scD:0,bD:0 };

                            cats.forEach((cat, ci) => {
                                const d   = (emp.category_qty_map||{})[`${emp.id}_${cat}`]||{};
                                const sG=parseFloat(d.starting_qty_gold||0), iG=parseFloat(d.issued_qty_gold||0), lG=parseFloat(d.loss_qty_gold||0), scG=parseFloat(d.scrap_qty_gold||0), bG=parseFloat(d.balance_qty_gold||0);
                                const sD=parseFloat(d.starting_qty_diamond||0), iD=parseFloat(d.issued_qty_diamond||0), lD=parseFloat(d.loss_qty_diamond||0), scD=parseFloat(d.scrap_qty_diamond||0), bD=parseFloat(d.balance_qty_diamond||0);
                                const aG=sG+iG-lG-scG-bG, aD=sD+iD-lD-scD-bD;
                                const gLP=aG!==0?(lG/aG)*100:0, dLP=aD!==0?(lD/aD)*100:0;
                                sub.sG+=sG;sub.iG+=iG;sub.lG+=lG;sub.scG+=scG;sub.bG+=bG;
                                sub.sD+=sD;sub.iD+=iD;sub.lD+=lD;sub.scD+=scD;sub.bD+=bD;
                                gt.sG+=sG;gt.iG+=iG;gt.lG+=lG;gt.scG+=scG;gt.bG+=bG;
                                gt.sD+=sD;gt.iD+=iD;gt.lD+=lD;gt.scD+=scD;gt.bD+=bD;

                                const isFirst = ci===0;
                                const showLoc = isFirst && !locShown;
                                const printDesign = (emp.category_print_design_map||{})[cat] || '-';
                                const catBagCount = (emp.category_bag_count_map||{})[cat] || 0;
                                const dr = ws.addRow([
                                    showLoc?locName:'', isFirst?deptName:'', isFirst?empName:'',
                                    isFirst?bagCount:'', cat, printDesign, catBagCount,
                                    +roundToTwo(sG), +roundToTwo(aG), +roundToTwo(lG), roundToTwo(gLP)+'%',
                                    +roundToTwo(sD), +roundToTwo(aD), +roundToTwo(lD), roundToTwo(dLP)+'%',
                                    '-','-','-','-'
                                ]);
                                styleRow(dr, C.rowBg, normalFont, ECOL);
                                redCols(dr, EMP_LOSS_COLS);
                                if (showLoc) locShown = true;
                            });

                            if (cats.length > 0) {
                                const aG=sub.sG+sub.iG-sub.lG-sub.scG-sub.bG, aD=sub.sD+sub.iD-sub.lD-sub.scD-sub.bD;
                                const sr = ws.addRow(['','',`Total (${empName})`,bagCount,'','','',+roundToTwo(sub.sG),+roundToTwo(aG),+roundToTwo(sub.lG),'',+roundToTwo(sub.sD),+roundToTwo(aD),+roundToTwo(sub.lD),'','','','','']);
                                styleRow(sr, C.subtotalBg, boldFont, ECOL);
                                redCols(sr, [10,14]);
                            }
                        });
                    });
                });

            } else {
                // ── DEPARTMENT TABLE ────────────────────────────────────
                const DEPT_HEADERS = [
                    'Location','Department','No. of Bags','Item Category','Print Design (Assembly Item)','Bags',
                    'TM Production Gold','Actual Production Gold','Loss Qty Gold','Gold Loss %',
                    'TM Production Diamond','Actual Production Diamond','Loss Qty Diamond','Diamond Loss %',
                    'Gold Recovery Weight (gm)','Net Loss Gold','Diamond Recovery Weight (ct)','Net Loss Diamond'
                ];
                const DCOL = DEPT_HEADERS.length;
                const DEPT_LOSS_COLS = [9,10,13,14,16,18];
                const dhRow = ws.addRow(DEPT_HEADERS);
                styleRow(dhRow, C.headerBg, headerFont, DCOL);
                dhRow.height = 30;
                DEPT_HEADERS.forEach((h, i) => { ws.getColumn(i+1).width = i===0?14:i<=3?16:18; });

                let gt = { sG:0,iG:0,lG:0,scG:0,bG:0, sD:0,iD:0,lD:0,scD:0,bD:0 };

                locations.value.forEach(loc => {
                    const locName = loc.name?.value || "";
                    let locShown = false;
                    (loc.departments || []).forEach(dept => {
                        const deptName = dept.name || "";
                        const bagCount = dept.bag_count || 0;
                        const cats     = dept.unique_categories_array || [];
                        let sub = { sG:0,iG:0,lG:0,scG:0,bG:0, sD:0,iD:0,lD:0,scD:0,bD:0 };

                        cats.forEach((cat, ci) => {
                            const d   = (dept.category_qty_map||{})[`${dept.id}_${cat}`]||{};
                            const sG=parseFloat(d.starting_qty_gold||0), iG=parseFloat(d.issued_qty_gold||0), lG=parseFloat(d.loss_qty_gold||0), scG=parseFloat(d.scrap_qty_gold||0), bG=parseFloat(d.balance_qty_gold||0);
                            const sD=parseFloat(d.starting_qty_diamond||0), iD=parseFloat(d.issued_qty_diamond||0), lD=parseFloat(d.loss_qty_diamond||0), scD=parseFloat(d.scrap_qty_diamond||0), bD=parseFloat(d.balance_qty_diamond||0);
                            const aG=sG+iG-lG-scG-bG, aD=sD+iD-lD-scD-bD;
                            const gLP=aG!==0?(lG/aG)*100:0, dLP=aD!==0?(lD/aD)*100:0;
                            sub.sG+=sG;sub.iG+=iG;sub.lG+=lG;sub.scG+=scG;sub.bG+=bG;
                            sub.sD+=sD;sub.iD+=iD;sub.lD+=lD;sub.scD+=scD;sub.bD+=bD;
                            gt.sG+=sG;gt.iG+=iG;gt.lG+=lG;gt.scG+=scG;gt.bG+=bG;
                            gt.sD+=sD;gt.iD+=iD;gt.lD+=lD;gt.scD+=scD;gt.bD+=bD;

                            const isFirst = ci===0;
                            const showLoc = isFirst && !locShown;
                            const printDesign = (dept.category_print_design_map||{})[cat] || '-';
                            const catBagCount = (dept.category_bag_count_map||{})[cat] || 0;
                            const dr = ws.addRow([
                                showLoc?locName:'', isFirst?deptName:'',
                                isFirst?bagCount:'', cat, printDesign, catBagCount,
                                +roundToTwo(sG), +roundToTwo(aG), +roundToTwo(lG), roundToTwo(gLP)+'%',
                                +roundToTwo(sD), +roundToTwo(aD), +roundToTwo(lD), roundToTwo(dLP)+'%',
                                '-','-','-','-'
                            ]);
                            styleRow(dr, C.rowBg, normalFont, DCOL);
                            redCols(dr, DEPT_LOSS_COLS);
                            if (showLoc) locShown = true;
                        });

                        if (cats.length > 0) {
                            const aG=sub.sG+sub.iG-sub.lG-sub.scG-sub.bG, aD=sub.sD+sub.iD-sub.lD-sub.scD-sub.bD;
                            const sr = ws.addRow(['',`Total (${deptName})`,bagCount,'','','',+roundToTwo(sub.sG),+roundToTwo(aG),+roundToTwo(sub.lG),'',+roundToTwo(sub.sD),+roundToTwo(aD),+roundToTwo(sub.lD),'','','','','']);
                            styleRow(sr, C.subtotalBg, boldFont, DCOL);
                            redCols(sr, [9,13]);
                        }
                    });
                });

                const aG=gt.sG+gt.iG-gt.lG-gt.scG-gt.bG, aD=gt.sD+gt.iD-gt.lD-gt.scD-gt.bD;
                const allDeptBags = new Set();
                locations.value.forEach(loc => (loc.departments||[]).forEach(dept => (dept.unique_bags_array||[]).forEach(b => allDeptBags.add(b))));
                const grandDeptBagCount = allDeptBags.size || locations.value.reduce((s,loc)=>(loc.departments||[]).reduce((s2,dept)=>s2+parseInt(dept.bag_count||0),s),0);
                const dgr = ws.addRow(['','GRAND TOTAL',grandDeptBagCount,'','','',+roundToTwo(gt.sG),+roundToTwo(aG),+roundToTwo(gt.lG),'',+roundToTwo(gt.sD),+roundToTwo(aD),+roundToTwo(gt.lD),'','','','','']);
                styleRow(dgr, C.grandBg, boldFont, DCOL);
                redCols(dgr, [9,13]);
            }

            // Download as .xlsx
            const timestamp = new Date().toISOString().replace(/[-T:]/g, "_").split(".")[0];
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer], { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Efficiency_Report_${timestamp}.xlsx`);
        };



        // **Helper Function to Round Values to 2 Decimal Places**
        const roundToTwo = (value) => {
            return value ? parseFloat(value).toFixed(2) : "0.00";
        };

        // Helper function to get total actual production gold for a location
        const getLocationTotalActualProductionGold = (location) => {
            if (!location.departments || location.departments.length === 0) return 0;
            let sum = 0;
            location.departments.forEach(dept => {
                sum += getDepartmentTotalActualProductionGold(dept);
            });
            return sum;
        };

        // Helper function to get total actual production diamond for a location
        const getLocationTotalActualProductionDiamond = (location) => {
            if (!location.departments || location.departments.length === 0) return 0;
            let sum = 0;
            location.departments.forEach(dept => {
                sum += getDepartmentTotalActualProductionDiamond(dept);
            });
            return sum;
        };

        // Helper function to get total unique bags for a location
        const getLocationTotalBagCount = (location) => {
            if (!location.departments || location.departments.length === 0) return 0;
            const uniqueBags = new Set();
            location.departments.forEach(dept => {
                if (dept.unique_bags_array && Array.isArray(dept.unique_bags_array)) {
                    dept.unique_bags_array.forEach(bag => uniqueBags.add(bag));
                }
            });
            // If no unique_bags_array, fallback to summing bag_count
            if (uniqueBags.size === 0) {
                let sum = 0;
                location.departments.forEach(dept => {
                    sum += parseInt(dept.bag_count || 0);
                });
                return sum;
            }
            return uniqueBags.size;
        };

        // Helper function to get total issued quantity gold for a location
        const getLocationTotalIssuedQtyGold = (location) => {
            if (!location.departments || location.departments.length === 0) return 0;
            let sum = 0;
            location.departments.forEach(dept => {
                sum += getDepartmentTotalIssuedQtyGold(dept);
            });
            return sum;
        };

        // Helper function to get total issued quantity diamond for a location
        const getLocationTotalIssuedQtyDiamond = (location) => {
            if (!location.departments || location.departments.length === 0) return 0;
            let sum = 0;
            location.departments.forEach(dept => {
                sum += getDepartmentTotalIssuedQtyDiamond(dept);
            });
            return sum;
        };

        // Helper function to get total loss quantity gold for a location
        const getLocationTotalLossQtyGold = (location) => {
            if (!location.departments || location.departments.length === 0) return 0;
            let sum = 0;
            location.departments.forEach(dept => {
                sum += getDepartmentTotalLossQtyGold(dept);
            });
            return sum;
        };

        // Helper function to get total loss quantity diamond for a location
        const getLocationTotalLossQtyDiamond = (location) => {
            if (!location.departments || location.departments.length === 0) return 0;
            let sum = 0;
            location.departments.forEach(dept => {
                sum += getDepartmentTotalLossQtyDiamond(dept);
            });
            return sum;
        };

        // Helper function to get total issued pieces diamond for a location
        const getLocationTotalIssuedPiecesDiamond = (location) => {
            if (!location.departments || location.departments.length === 0) return 0;
            let sum = 0;
            location.departments.forEach(dept => {
                sum += getDepartmentTotalIssuedPiecesDiamond(dept);
            });
            return sum;
        };

        // Helper function to get total loss pieces diamond for a location
        const getLocationTotalLossPiecesDiamond = (location) => {
            if (!location.departments || location.departments.length === 0) return 0;
            let sum = 0;
            location.departments.forEach(dept => {
                sum += getDepartmentTotalLossPiecesDiamond(dept);
            });
            return sum;
        };

        // Helper function to get total issued quantity gold for a department
        const getDepartmentTotalIssuedQtyGold = (dept) => {
            if (!dept.category_qty_map) return 0;
            let sum = 0;
            Object.keys(dept.category_qty_map).forEach(key => {
                // Only sum if the key starts with this department's ID
                if (key.startsWith(`${dept.id}_`)) {
                    const catData = dept.category_qty_map[key];
                    sum += parseFloat(catData.issued_qty_gold || 0);
                }
            });
            return sum;
        };

        // Helper function to get total issued quantity diamond for a department
        const getDepartmentTotalIssuedQtyDiamond = (dept) => {
            if (!dept.category_qty_map) return 0;
            let sum = 0;
            Object.keys(dept.category_qty_map).forEach(key => {
                // Only sum if the key starts with this department's ID
                if (key.startsWith(`${dept.id}_`)) {
                    const catData = dept.category_qty_map[key];
                    sum += parseFloat(catData.issued_qty_diamond || 0);
                }
            });
            return sum;
        };

        // Helper function to get total issued quantity gold for an employee
        const getEmployeeTotalIssuedQtyGold = (emp) => {
            if (emp.categories && emp.categories.length > 0) {
                let sum = 0;
                emp.categories.forEach(cat => {
                    sum += parseFloat(cat.issued_qty_gold || 0);
                });
                return sum;
            }
            return parseFloat(emp.issued_quantity_gold || 0);
        };

        // Helper function to get total issued quantity diamond for an employee
        const getEmployeeTotalIssuedQtyDiamond = (emp) => {
            if (emp.categories && emp.categories.length > 0) {
                let sum = 0;
                emp.categories.forEach(cat => {
                    sum += parseFloat(cat.issued_qty_diamond || 0);
                });
                return sum;
            }
            return parseFloat(emp.issued_quantity_diamond || 0);
        };
        
        // Helper function to get total loss quantity gold for a department
        const getDepartmentTotalLossQtyGold = (dept) => {
            if (!dept.category_qty_map) return 0;
            let sum = 0;
            Object.keys(dept.category_qty_map).forEach(key => {
                // Only sum if the key starts with this department's ID
                if (key.startsWith(`${dept.id}_`)) {
                    const catData = dept.category_qty_map[key];
                    sum += parseFloat(catData.loss_qty_gold || 0);
                }
            });
            return sum;
        };

        // Helper function to get total loss quantity diamond for a department
        const getDepartmentTotalLossQtyDiamond = (dept) => {
            if (!dept.category_qty_map) return 0;
            let sum = 0;
            Object.keys(dept.category_qty_map).forEach(key => {
                // Only sum if the key starts with this department's ID
                if (key.startsWith(`${dept.id}_`)) {
                    const catData = dept.category_qty_map[key];
                    sum += parseFloat(catData.loss_qty_diamond || 0);
                }
            });
            return sum;
        };

        // Helper function to get total loss quantity gold for an employee
        const getEmployeeTotalLossQtyGold = (emp) => {
            if (!emp.categories || emp.categories.length === 0) return 0;
            let sum = 0;
            emp.categories.forEach(cat => {
                sum += parseFloat(cat.loss_qty_gold || 0);
            });
            return sum;
        };
        
        // Helper function to get total loss quantity diamond for an employee
        const getEmployeeTotalLossQtyDiamond = (emp) => {
            if (emp.categories && emp.categories.length > 0) {
                let sum = 0;
                emp.categories.forEach(cat => {
                    sum += parseFloat(cat.loss_qty_diamond || 0);
                });
                return sum;
            }
            return parseFloat(emp.loss_quantity_diamond || 0);
        };

        // Helper function to get total actual production gold for a department
        const getDepartmentTotalActualProductionGold = (dept) => {
            if (!dept.category_qty_map) return 0;
            let sum = 0;
            Object.keys(dept.category_qty_map).forEach(key => {
                if (key.startsWith(`${dept.id}_`)) {
                    const catData = dept.category_qty_map[key];
                    const actualProd = (
                        parseFloat(catData.starting_qty_gold || 0) +
                        parseFloat(catData.issued_qty_gold || 0) -
                        parseFloat(catData.loss_qty_gold || 0) -
                        parseFloat(catData.scrap_qty_gold || 0) -
                        parseFloat(catData.balance_qty_gold || 0)
                    );
                    sum += actualProd;
                }
            });
            return sum;
        };

        // Helper function to get total actual production diamond for a department
        const getDepartmentTotalActualProductionDiamond = (dept) => {
            if (!dept.category_qty_map) return 0;
            let sum = 0;
            Object.keys(dept.category_qty_map).forEach(key => {
                if (key.startsWith(`${dept.id}_`)) {
                    const catData = dept.category_qty_map[key];
                    const actualProd = (
                        parseFloat(catData.starting_qty_diamond || 0) +
                        parseFloat(catData.issued_qty_diamond || 0) -
                        parseFloat(catData.loss_qty_diamond || 0) -
                        parseFloat(catData.scrap_qty_diamond || 0) -
                        parseFloat(catData.balance_qty_diamond || 0)
                    );
                    sum += actualProd;
                }
            });
            return sum;
        };

        // Helper function to get total actual production gold for an employee
        const getEmployeeTotalActualProductionGold = (emp) => {
            if (!emp.categories || emp.categories.length === 0) return 0;
            let sum = 0;
            emp.categories.forEach(cat => {
                const actualProd = (
                    parseFloat(cat.starting_qty_gold || 0) +
                    parseFloat(cat.issued_qty_gold || 0) -
                    parseFloat(cat.loss_qty_gold || 0) -
                    parseFloat(cat.scrap_qty_gold || 0) -
                    parseFloat(cat.balance_qty_gold || 0)
                );
                sum += actualProd;
            });
            return sum;
        };

        // Helper function to get total actual production diamond for an employee
        const getEmployeeTotalActualProductionDiamond = (emp) => {
            if (!emp.categories || emp.categories.length === 0) return 0;
            let sum = 0;
            emp.categories.forEach(cat => {
                const actualProd = (
                    parseFloat(cat.starting_qty_diamond || 0) +
                    parseFloat(cat.issued_qty_diamond || 0) -
                    parseFloat(cat.loss_qty_diamond || 0) -
                    parseFloat(cat.scrap_qty_diamond || 0) -
                    parseFloat(cat.balance_qty_diamond || 0)
                );
                sum += actualProd;
            });
            return sum;
        };


        // Helper function to get total issued pieces diamond for a department
        const getDepartmentTotalIssuedPiecesDiamond = (dept) => {
            if (!dept.category_qty_map) return 0;
            let sum = 0;
            Object.keys(dept.category_qty_map).forEach(key => {
                if (key.startsWith(`${dept.id}_`)) {
                    const catData = dept.category_qty_map[key];
                    sum += parseFloat(catData.issued_pieces_diamond || 0);
                }
            });
            return sum;
        };

        // Helper function to get total loss pieces diamond for a department
        const getDepartmentTotalLossPiecesDiamond = (dept) => {
            if (!dept.category_qty_map) return 0;
            let sum = 0;
            Object.keys(dept.category_qty_map).forEach(key => {
                if (key.startsWith(`${dept.id}_`)) {
                    const catData = dept.category_qty_map[key];
                    sum += parseFloat(catData.loss_pieces_diamond || 0);
                }
            });
            return sum;
        };

        // Helper function to get total issued pieces diamond for an employee
        const getEmployeeTotalIssuedPiecesDiamond = (emp) => {
            if (!emp.categories || emp.categories.length === 0) return 0;
            let sum = 0;
            emp.categories.forEach(cat => {
                sum += parseFloat(cat.issued_pieces_diamond || 0);
            });
            return sum;
        };

        // Helper function to get total loss pieces diamond for an employee
        const getEmployeeTotalLossPiecesDiamond = (emp) => {
            if (!emp.categories || emp.categories.length === 0) return 0;
            let sum = 0;
            emp.categories.forEach(cat => {
                sum += parseFloat(cat.loss_pieces_diamond || 0);
            });
            return sum;
        };

        

        // Helper function to get raw numeric category-level starting quantity for Gold (for calculations)
        const getCategoryStartingQtyGoldRaw = (dept, category) => {
            if (!dept.category_qty_map) return 0;
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? parseFloat(data.starting_qty_gold || 0) : 0;
        };

        // Helper function to get raw numeric category-level starting quantity for Diamond (for calculations)
        const getCategoryStartingQtyDiamondRaw = (dept, category) => {
            if (!dept.category_qty_map) return 0;
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? parseFloat(data.starting_qty_diamond || 0) : 0;
        };

        // Helper function to get raw numeric category-level issued quantity for Gold (for calculations)
        const getCategoryIssuedQtyGoldRaw = (dept, category) => {
            if (!dept.category_qty_map) return 0;
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? parseFloat(data.issued_qty_gold || 0) : 0;
        };

        // Helper function to get raw numeric category-level issued quantity for Diamond (for calculations)
        const getCategoryIssuedQtyDiamondRaw = (dept, category) => {
            if (!dept.category_qty_map) return 0;
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? parseFloat(data.issued_qty_diamond || 0) : 0;
        };

        // Helper function to get raw numeric category-level loss quantity for Gold (for calculations)
        const getCategoryLossQtyGoldRaw = (dept, category) => {
            if (!dept.category_qty_map) return 0;
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? parseFloat(data.loss_qty_gold || 0) : 0;
        };

        // Helper function to get raw numeric category-level loss quantity for Diamond (for calculations)
        const getCategoryLossQtyDiamondRaw = (dept, category) => {
            if (!dept.category_qty_map) return 0;
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? parseFloat(data.loss_qty_diamond || 0) : 0;
        };

        // Helper function to get raw numeric category-level scrap quantity for Gold (for calculations)
        const getCategoryScrapQtyGoldRaw = (dept, category) => {
            if (!dept.category_qty_map) return 0;
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? parseFloat(data.scrap_qty_gold || 0) : 0;
        };

        // Helper function to get raw numeric category-level scrap quantity for Diamond (for calculations)
        const getCategoryScrapQtyDiamondRaw = (dept, category) => {
            if (!dept.category_qty_map) return 0;
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? parseFloat(data.scrap_qty_diamond || 0) : 0;
        };

        // Helper function to get raw numeric category-level balance quantity for Gold (for calculations)
        const getCategoryBalanceQtyGoldRaw = (dept, category) => {
            if (!dept.category_qty_map) return 0;
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? parseFloat(data.balance_qty_gold || 0) : 0;
        };

        // Helper function to get raw numeric category-level balance quantity for Diamond (for calculations)
        const getCategoryBalanceQtyDiamondRaw = (dept, category) => {
            if (!dept.category_qty_map) return 0;
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? parseFloat(data.balance_qty_diamond || 0) : 0;
        };

        // Helper function to get category-level starting quantity for Gold
        const getCategoryStartingQtyGold = (dept, category) => {
            if (!dept.category_qty_map) return '-';
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? roundToTwo(data.starting_qty_gold) : '-';
        };

        // Helper function to get category-level starting quantity for Diamond
        const getCategoryStartingQtyDiamond = (dept, category) => {
            if (!dept.category_qty_map) return '-';
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? roundToTwo(data.starting_qty_diamond) : '-';
        };

        // Generic wrapper for starting quantity (defaults to Gold)
        const getCategoryStartingQty = (dept, category) => {
            return getCategoryStartingQtyGold(dept, category);
        };

        // Helper function to get category-level issued quantity for Gold
        const getCategoryIssuedQtyGold = (dept, category) => {
            if (!dept.category_qty_map) return '-';
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? roundToTwo(data.issued_qty_gold) : '-';
        };

        // Helper function to get category-level issued quantity for Diamond
        const getCategoryIssuedQtyDiamond = (dept, category) => {
            if (!dept.category_qty_map) return '-';
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? roundToTwo(data.issued_qty_diamond) : '-';
        };

        // Generic wrapper for issued quantity (defaults to Gold)
        const getCategoryIssuedQty = (dept, category) => {
            return getCategoryIssuedQtyGold(dept, category);
        };

        // Helper function to get category-level loss quantity for Gold
        const getCategoryLossQtyGold = (dept, category) => {
            if (!dept.category_qty_map) return '-';
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? roundToTwo(data.loss_qty_gold) : '-';
        };

        // Helper function to get category-level loss quantity for Diamond
        const getCategoryLossQtyDiamond = (dept, category) => {
            if (!dept.category_qty_map) return '-';
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? roundToTwo(data.loss_qty_diamond) : '-';
        };

        // Generic wrapper for loss quantity (defaults to Gold)
        const getCategoryLossQty = (dept, category) => {
            return getCategoryLossQtyGold(dept, category);
        };

        // Helper function to get category-level scrap quantity for Gold
        const getCategoryScrapQtyGold = (dept, category) => {
            if (!dept.category_qty_map) return '-';
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? roundToTwo(data.scrap_qty_gold) : '-';
        };

        // Helper function to get category-level scrap quantity for Diamond
        const getCategoryScrapQtyDiamond = (dept, category) => {
            if (!dept.category_qty_map) return '-';
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? roundToTwo(data.scrap_qty_diamond) : '-';
        };

        // Generic wrapper for scrap quantity (defaults to Gold)
        const getCategoryScrapQty = (dept, category) => {
            return getCategoryScrapQtyGold(dept, category);
        };

        // Helper function to get category-level balance quantity for Gold
        const getCategoryBalanceQtyGold = (dept, category) => {
            if (!dept.category_qty_map) return '-';
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? roundToTwo(data.balance_qty_gold) : '-';
        };

        // Helper function to get category-level balance quantity for Diamond
        const getCategoryBalanceQtyDiamond = (dept, category) => {
            if (!dept.category_qty_map) return '-';
            const key = `${dept.id}_${category}`;
            const data = dept.category_qty_map[key];
            return data ? roundToTwo(data.balance_qty_diamond) : '-';
        };

        // Generic wrapper for balance quantity (defaults to Gold)
        const getCategoryBalanceQty = (dept, category) => {
            return getCategoryBalanceQtyGold(dept, category);
        };

        // ===== EMPLOYEE CATEGORY-LEVEL GETTER FUNCTIONS =====

        // Helper function to get raw numeric employee category-level starting quantity for Gold (for calculations)
        const getEmployeeCategoryStartingQtyGoldRaw = (emp, category) => {
            if (!emp.category_qty_map) {
                console.log(`[getEmployeeCategoryStartingQtyGoldRaw] No category_qty_map for employee:`, emp);
                return 0;
            }
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            console.log(`[getEmployeeCategoryStartingQtyGoldRaw] Employee ID: ${emp.id}, Category: ${category}, Key: ${key}, Data:`, data);
            return data ? parseFloat(data.starting_qty_gold || 0) : 0;
        };

        // Helper function to get raw numeric employee category-level starting quantity for Diamond (for calculations)
        const getEmployeeCategoryStartingQtyDiamondRaw = (emp, category) => {
            if (!emp.category_qty_map) return 0;
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? parseFloat(data.starting_qty_diamond || 0) : 0;
        };

        // Helper function to get raw numeric employee category-level issued quantity for Gold (for calculations)
        const getEmployeeCategoryIssuedQtyGoldRaw = (emp, category) => {
            if (!emp.category_qty_map) return 0;
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? parseFloat(data.issued_qty_gold || 0) : 0;
        };

        // Helper function to get raw numeric employee category-level issued quantity for Diamond (for calculations)
        const getEmployeeCategoryIssuedQtyDiamondRaw = (emp, category) => {
            if (!emp.category_qty_map) return 0;
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? parseFloat(data.issued_qty_diamond || 0) : 0;
        };

        // Helper function to get raw numeric employee category-level loss quantity for Gold (for calculations)
        const getEmployeeCategoryLossQtyGoldRaw = (emp, category) => {
            if (!emp.category_qty_map) return 0;
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? parseFloat(data.loss_qty_gold || 0) : 0;
        };

        // Helper function to get raw numeric employee category-level loss quantity for Diamond (for calculations)
        const getEmployeeCategoryLossQtyDiamondRaw = (emp, category) => {
            if (!emp.category_qty_map) return 0;
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? parseFloat(data.loss_qty_diamond || 0) : 0;
        };

        // Helper function to get raw numeric employee category-level scrap quantity for Gold (for calculations)
        const getEmployeeCategoryScrapQtyGoldRaw = (emp, category) => {
            if (!emp.category_qty_map) return 0;
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? parseFloat(data.scrap_qty_gold || 0) : 0;
        };

        // Helper function to get raw numeric employee category-level scrap quantity for Diamond (for calculations)
        const getEmployeeCategoryScrapQtyDiamondRaw = (emp, category) => {
            if (!emp.category_qty_map) return 0;
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? parseFloat(data.scrap_qty_diamond || 0) : 0;
        };

        // Helper function to get raw numeric employee category-level balance quantity for Gold (for calculations)
        const getEmployeeCategoryBalanceQtyGoldRaw = (emp, category) => {
            if (!emp.category_qty_map) return 0;
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? parseFloat(data.balance_qty_gold || 0) : 0;
        };

        // Helper function to get raw numeric employee category-level balance quantity for Diamond (for calculations)
        const getEmployeeCategoryBalanceQtyDiamondRaw = (emp, category) => {
            if (!emp.category_qty_map) return 0;
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? parseFloat(data.balance_qty_diamond || 0) : 0;
        };

        // Helper function to get employee category-level starting quantity for Gold
        const getEmployeeCategoryStartingQtyGold = (emp, category) => {
            if (!emp.category_qty_map) {
                console.log(`[getEmployeeCategoryStartingQtyGold] No category_qty_map for employee:`, emp);
                return '-';
            }
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            console.log(`[getEmployeeCategoryStartingQtyGold] Employee ID: ${emp.id}, Category: ${category}, Key: ${key}, Data:`, data);
            return data ? roundToTwo(data.starting_qty_gold) : '-';
        };

        // Helper function to get employee category-level starting quantity for Diamond
        const getEmployeeCategoryStartingQtyDiamond = (emp, category) => {
            if (!emp.category_qty_map) return '-';
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? roundToTwo(data.starting_qty_diamond) : '-';
        };

        // Generic wrapper for employee category starting quantity (defaults to Gold)
        const getEmployeeCategoryStartingQty = (emp, category) => {
            return getEmployeeCategoryStartingQtyGold(emp, category);
        };

        // Helper function to get employee category-level issued quantity for Gold
        const getEmployeeCategoryIssuedQtyGold = (emp, category) => {
            if (!emp.category_qty_map) return '-';
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? roundToTwo(data.issued_qty_gold) : '-';
        };

        // Helper function to get employee category-level issued quantity for Diamond
        const getEmployeeCategoryIssuedQtyDiamond = (emp, category) => {
            if (!emp.category_qty_map) return '-';
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? roundToTwo(data.issued_qty_diamond) : '-';
        };

        // Generic wrapper for employee category issued quantity (defaults to Gold)
        const getEmployeeCategoryIssuedQty = (emp, category) => {
            return getEmployeeCategoryIssuedQtyGold(emp, category);
        };

        // Helper function to get employee category-level loss quantity for Gold
        const getEmployeeCategoryLossQtyGold = (emp, category) => {
            if (!emp.category_qty_map) return '-';
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? roundToTwo(data.loss_qty_gold) : '-';
        };

        // Helper function to get employee category-level loss quantity for Diamond
        const getEmployeeCategoryLossQtyDiamond = (emp, category) => {
            if (!emp.category_qty_map) return '-';
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? roundToTwo(data.loss_qty_diamond) : '-';
        };

        // Generic wrapper for employee category loss quantity (defaults to Gold)
        const getEmployeeCategoryLossQty = (emp, category) => {
            return getEmployeeCategoryLossQtyGold(emp, category);
        };

        // Helper function to get employee category-level scrap quantity for Gold
        const getEmployeeCategoryScrapQtyGold = (emp, category) => {
            if (!emp.category_qty_map) return '-';
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? roundToTwo(data.scrap_qty_gold) : '-';
        };

        // Helper function to get employee category-level scrap quantity for Diamond
        const getEmployeeCategoryScrapQtyDiamond = (emp, category) => {
            if (!emp.category_qty_map) return '-';
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? roundToTwo(data.scrap_qty_diamond) : '-';
        };

        // Generic wrapper for employee category scrap quantity (defaults to Gold)
        const getEmployeeCategoryScrapQty = (emp, category) => {
            return getEmployeeCategoryScrapQtyGold(emp, category);
        };

        // Helper function to get employee category-level balance quantity for Gold
        const getEmployeeCategoryBalanceQtyGold = (emp, category) => {
            if (!emp.category_qty_map) return '-';
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? roundToTwo(data.balance_qty_gold) : '-';
        };

        // Helper function to get employee category-level balance quantity for Diamond
        const getEmployeeCategoryBalanceQtyDiamond = (emp, category) => {
            if (!emp.category_qty_map) return '-';
            const key = `${emp.id}_${category}`;
            const data = emp.category_qty_map[key];
            return data ? roundToTwo(data.balance_qty_diamond) : '-';
        };

        // Generic wrapper for employee category balance quantity (defaults to Gold)
        const getEmployeeCategoryBalanceQty = (emp, category) => {
            return getEmployeeCategoryBalanceQtyGold(emp, category);
        };

        // Helper function to sum total starting quantity (gold + diamond) for an employee across all categories
        const getEmployeeTotalStartingQtyAllCategories = (emp) => {
            if (!emp.category_qty_map || !emp.unique_categories_array) return 0;
            let sum = 0;
            emp.unique_categories_array.forEach(category => {
                const key = `${emp.id}_${category}`;
                const data = emp.category_qty_map[key];
                if (data) {
                    sum += parseFloat(data.starting_qty_gold || 0) + parseFloat(data.starting_qty_diamond || 0);
                }
            });
            return sum;
        };

        // Helper function to sum total issued quantity (gold + diamond) for an employee across all categories
        const getEmployeeTotalIssuedQtyAllCategories = (emp) => {
            if (!emp.category_qty_map || !emp.unique_categories_array) return 0;
            let sum = 0;
            emp.unique_categories_array.forEach(category => {
                const key = `${emp.id}_${category}`;
                const data = emp.category_qty_map[key];
                if (data) {
                    sum += parseFloat(data.issued_qty_gold || 0) + parseFloat(data.issued_qty_diamond || 0);
                }
            });
            return sum;
        };

        // Helper function to sum total loss quantity (gold + diamond) for an employee across all categories
        const getEmployeeTotalLossQtyAllCategories = (emp) => {
            if (!emp.category_qty_map || !emp.unique_categories_array) return 0;
            let sum = 0;
            emp.unique_categories_array.forEach(category => {
                const key = `${emp.id}_${category}`;
                const data = emp.category_qty_map[key];
                if (data) {
                    sum += parseFloat(data.loss_qty_gold || 0) + parseFloat(data.loss_qty_diamond || 0);
                }
            });
            return sum;
        };

        // Function to fetch efficiency analysis data for a specific location
        // const fetchEfficiencyAnalysisData = async (locationId = null) => {
        //     try {
        //         loading.value = true;
        //         showNoDataPopup.value = false; // Reset popup visibility

        //         // Convert date range to properly formatted strings (fixing time zone issue)
        //         if (!selectedDateRange.value || selectedDateRange.value.length < 2) return;

        //         const formatDate = (date) => {
        //             const offset = date.getTimezoneOffset();
        //             date = new Date(date.getTime() - (offset * 60 * 1000)); // Adjust for timezone offset
        //             return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        //         };

        //         const formattedStartDate = formatDate(selectedDateRange.value[0]);
        //         const formattedEndDate = formatDate(selectedDateRange.value[1]);

        //         console.log(`Fetching data for ${locationId ? `Location: ${locationId}` : 'All Locations'}, Start Date: ${formattedStartDate}, End Date: ${formattedEndDate}`);

        //         // Call API with the selected date range
        //         await fetchListEfficiencyAnalysis(locationId, formattedStartDate, formattedEndDate);

        //         if (listEfficiencyData.value && Object.keys(listEfficiencyData.value).length > 0) {
        //             console.log("Efficiency Data:", listEfficiencyData.value);

        //             if (!locationId) {
        //                 // If no location is selected, update all locations
        //                 locations.value = Object.entries(listEfficiencyData.value).map(([locId, locData]) => ({
        //                     internalid: { value: locId },
        //                     name: { value: locData.location_name },
        //                     tmproduction_gold: locData.tmproduction_gold || 0,
        //                     loss_gold: locData.loss_gold || 0,
        //                     tmproduction_diamond: locData.tmproduction_diamond || 0,
        //                     loss_diamond: locData.loss_diamond || 0,
        //                     tmproduction_diamond_pieces: locData.tmproduction_diamond_pieces || 0,
        //                     loss_diamond_pieces: locData.loss_diamond_pieces || 0,
        //                     departments: Object.entries(locData.departments || {}).map(([deptId, dept]) => ({
        //                         name: dept.department_name,
        //                         production: dept.production,
        //                         loss: dept.loss,
        //                         date: dept.date,
        //                         production_diamond: dept.production_diamond,
        //                         loss_diamond: dept.loss_diamond,
        //                         loss_diamond_pieces: dept.loss_diamond_pieces,
        //                         production_diamond_pieces: dept.production_diamond_pieces,

        //                         employees: Object.entries(dept.employees || {}).map(([empId, emp]) => ({
        //                             id: empId,
        //                             name: emp.name !== "null null" ? emp.name : "Unknown Employee",
        //                             tmProduction: emp.tmProduction || 0,
        //                             tmProductionDiamond: emp.tmProductionDiamond || 0,
        //                             grossLossDiamond: emp.grossLossDiamond || 0,
        //                             grossLoss: emp.grossLoss || 0,
        //                             loss: emp.loss || 0,
        //                             netLoss: emp.netLoss || 0,
        //                             recovery: emp.recovery || 0,
        //                             date: emp.date || "N/A"
        //                         }))
        //                     }))
        //                 }));
        //             } else {
        //                 // Update specific location
        //                 const efficiencyData = listEfficiencyData.value[locationId];
        //                 const updatedLocation = locations.value.find(loc => loc.internalid.value === locationId);

        //                 if (updatedLocation && efficiencyData) {
        //                     updatedLocation.tmproduction_gold = efficiencyData.tmproduction_gold || 0;
        //                     updatedLocation.loss_gold = efficiencyData.loss_gold || 0;
        //                     updatedLocation.tmproduction_diamond = efficiencyData.tmproduction_diamond || 0;
        //                     updatedLocation.loss_diamond = efficiencyData.loss_diamond || 0;
        //                     updatedLocation.tmproduction_diamond_pieces = efficiencyData.tmproduction_diamond_pieces || 0;
        //                     updatedLocation.loss_diamond_pieces = efficiencyData.loss_diamond_pieces || 0;
        //                     updatedLocation.departments = Object.entries(efficiencyData.departments || {}).map(([deptId, dept]) => ({
        //                         name: dept.department_name,
        //                         production: dept.production,
        //                         loss: dept.loss,
        //                         date: dept.date,
        //                         production_diamond: dept.production_diamond,
        //                         loss_diamond: dept.loss_diamond,
        //                         loss_diamond_pieces: dept.loss_diamond_pieces,
        //                         production_diamond_pieces: dept.production_diamond_pieces,
        //                         employees: Object.entries(dept.employees || {}).map(([empId, emp]) => ({
        //                             id: empId,
        //                             name: emp.name !== "null null" ? emp.name : "Unknown Employee",
        //                             tmProduction: emp.tmProduction || 0,
        //                             grossLoss: emp.grossLoss || 0,
        //                             tmProductionDiamond: emp.tmProductionDiamond || 0,
        //                             grossLossDiamond: emp.grossLossDiamond || 0,
        //                             tmProductionDiamondPieces: emp.tmProductionDiamondPieces || 0,
        //                             grossLossDiamondPieces: emp.grossLossDiamondPieces || 0,
        //                             loss: emp.loss || 0,
        //                             netLoss: emp.netLoss || 0,
        //                             recovery: emp.recovery || 0,
        //                             date: emp.date || "N/A"
        //                         }))
        //                     }));
        //                 }
        //             }
        //         } else {
        //             // Show Popup if No Data Found
        //             showNoDataPopup.value = true;
        //             setTimeout(() => {
        //                 showNoDataPopup.value = false; // Auto-hide popup after 3 sec
        //                 selectedDateRange.value = getDefaultDateRange(); // ✅ Reset date filter value
        //             }, 3000);
        //         }
        //     } catch (err) {
        //         console.error("Error fetching efficiency analysis data:", err);
        //         showNoDataPopup.value = true; // Show popup in case of an error
        //         setTimeout(() => {
        //             showNoDataPopup.value = false;
        //             selectedDateRange.value = getDefaultDateRange(); // ✅ Reset date filter value
        //         }, 3000);
        //     } finally {
        //         loading.value = false;
        //     }
        // };
        //latest
        // const fetchEfficiencyAnalysisData = async (locationId = null) => {
        //     try {
        //         loading.value = true;
        //         showNoDataPopup.value = false;

        //         if (!selectedDateRange.value || selectedDateRange.value.length < 2) return;

        //         const formatDate = (date) => {
        //             const offset = date.getTimezoneOffset();
        //             date = new Date(date.getTime() - (offset * 60 * 1000));
        //             return date.toISOString().split('T')[0];
        //         };

        //         const formattedStartDate = formatDate(selectedDateRange.value[0]);
        //         const formattedEndDate = formatDate(selectedDateRange.value[1]);

        //         console.log(`Fetching data for ${locationId ? `Location: ${locationId}` : 'All Locations'}, Start Date: ${formattedStartDate}, End Date: ${formattedEndDate}`);

        //         // Fetch Efficiency Analysis Data
        //         await fetchListEfficiencyAnalysis(locationId, formattedStartDate, formattedEndDate);

        //         // Fetch Inventory Adjustments
        //         await fetchInventoryAdjustmentsDetails(formattedStartDate, formattedEndDate);

        //         if (listEfficiencyData.value && Object.keys(listEfficiencyData.value).length > 0) {
        //             console.log("Efficiency Data:", listEfficiencyData.value);

        //             let inventoryAdjustments = listInventoryAdjustments.value || [];
        //             console.log("Inventory Adjustments:", inventoryAdjustments);

        //             let departmentQuantities = {};
        //             let employeeQuantities = {}; // ✅ Stores department-wise employee data

        //             // **Process inventory adjustments to aggregate quantities by department & employee**
        //             inventoryAdjustments.forEach(item => {
        //                 const departmentId = item.custbody_jj_recovery_department;
        //                 const employeeId = item.custbody_jj_recovered_employee;
        //                 const key = `${departmentId}_${employeeId}`; // ✅ Unique Key for Department-Employee

        //                 const quantity = parseFloat(item.quantity || 0);

        //                 // Aggregate by department
        //                 if (!departmentQuantities[departmentId]) {
        //                     departmentQuantities[departmentId] = 0;
        //                 }
        //                 departmentQuantities[departmentId] += quantity;

        //                 // Aggregate by department-wise employee
        //                 if (!employeeQuantities[key]) {
        //                     employeeQuantities[key] = 0;
        //                 }
        //                 employeeQuantities[key] += quantity;
        //             });

        //             console.log("Aggregated Department Quantities:", departmentQuantities);
        //             console.log("Aggregated Employee Quantities:", employeeQuantities);

        //             if (!locationId) {
        //                 // ✅ Updating all locations
        //                 locations.value = Object.entries(listEfficiencyData.value).map(([locId, locData]) => ({
        //                     internalid: { value: locId },
        //                     name: { value: locData.location_name },
        //                     tmproduction_gold: locData.tmproduction_gold || 0,
        //                     loss_gold: locData.loss_gold || 0,
        //                     tmproduction_diamond: locData.tmproduction_diamond || 0,
        //                     loss_diamond: locData.loss_diamond || 0,
        //                     tmproduction_diamond_pieces: locData.tmproduction_diamond_pieces || 0,
        //                     loss_diamond_pieces: locData.loss_diamond_pieces || 0,
        //                     departments: Object.entries(locData.departments || {}).map(([deptId, dept]) => {
        //                         const goldRecoveryWeightDept = departmentQuantities[deptId] || 0;
        //                         const grossLossGoldDept = parseFloat(dept.loss || 0);
        //                         const netLossGoldDept = grossLossGoldDept - goldRecoveryWeightDept;

        //                         return {
        //                             name: dept.department_name,
        //                             production: dept.production,
        //                             loss: roundToTwo(grossLossGoldDept),
        //                             netLoss: roundToTwo(netLossGoldDept),
        //                             date: dept.date,
        //                             production_diamond: dept.production_diamond,
        //                             loss_diamond: dept.loss_diamond,
        //                             loss_diamond_pieces: dept.loss_diamond_pieces,
        //                             production_diamond_pieces: dept.production_diamond_pieces,
        //                             totalWeightGold: roundToTwo(goldRecoveryWeightDept),
        //                             employees: Object.entries(dept.employees || {}).map(([empId, emp]) => {
        //                                 const key = `${deptId}_${empId}`;
        //                                 const goldRecoveryWeight = employeeQuantities[key] || 0;
        //                                 const grossLossGold = parseFloat(emp.grossLoss || 0);
        //                                 const netLossGold = grossLossGold - goldRecoveryWeight;

        //                                 return {
        //                                     id: empId,
        //                                     name: emp.name !== "null null" ? emp.name : "Unknown Employee",
        //                                     tmProduction: emp.tmProduction || 0,
        //                                     tmProductionDiamond: emp.tmProductionDiamond || 0,
        //                                     grossLossDiamond: emp.grossLossDiamond || 0,
        //                                     grossLoss: roundToTwo(grossLossGold),
        //                                     loss: emp.loss || 0,
        //                                     netLoss: roundToTwo(netLossGold),
        //                                     recovery: emp.recovery || 0,
        //                                     date: emp.date || "N/A",
        //                                     tmGrossLossWeight: roundToTwo(goldRecoveryWeight)
        //                                 };
        //                             })
        //                         };
        //                     })
        //                 }));
        //             } else {
        //                 // ✅ Updating a specific location
        //                 const efficiencyData = listEfficiencyData.value[locationId];
        //                 const updatedLocation = locations.value.find(loc => loc.internalid.value === locationId);

        //                 if (updatedLocation && efficiencyData) {
        //                     updatedLocation.tmproduction_gold = efficiencyData.tmproduction_gold || 0;
        //                     updatedLocation.loss_gold = efficiencyData.loss_gold || 0;
        //                     updatedLocation.tmproduction_diamond = efficiencyData.tmproduction_diamond || 0;
        //                     updatedLocation.loss_diamond = efficiencyData.loss_diamond || 0;
        //                     updatedLocation.tmproduction_diamond_pieces = efficiencyData.tmproduction_diamond_pieces || 0;
        //                     updatedLocation.loss_diamond_pieces = efficiencyData.loss_diamond_pieces || 0;
        //                     updatedLocation.departments = Object.entries(efficiencyData.departments || {}).map(([deptId, dept]) => {
        //                         const goldRecoveryWeightDept = departmentQuantities[deptId] || 0;
        //                         const grossLossGoldDept = parseFloat(dept.loss || 0);
        //                         const netLossGoldDept = grossLossGoldDept - goldRecoveryWeightDept;

        //                         return {
        //                             name: dept.department_name,
        //                             production: dept.production,
        //                             loss: roundToTwo(grossLossGoldDept),
        //                             netLoss: roundToTwo(netLossGoldDept),
        //                             production_diamond: dept.production_diamond,
        //                             loss_diamond: dept.loss_diamond,
        //                             loss_diamond_pieces: dept.loss_diamond_pieces,
        //                             production_diamond_pieces: dept.production_diamond_pieces,
        //                             totalWeightGold: roundToTwo(goldRecoveryWeightDept),
        //                             employees: Object.entries(dept.employees || {}).map(([empId, emp]) => {
        //                                 const key = `${deptId}_${empId}`;
        //                                 const goldRecoveryWeight = employeeQuantities[key] || 0;
        //                                 const grossLossGold = parseFloat(emp.grossLoss || 0);
        //                                 const netLossGold = grossLossGold - goldRecoveryWeight;

        //                                 return {
        //                                     id: empId,
        //                                     name: emp.name !== "null null" ? emp.name : "Unknown Employee",
        //                                     tmProduction: emp.tmProduction || 0,
        //                                     tmProductionDiamond: emp.tmProductionDiamond || 0,
        //                                     grossLossDiamond: emp.grossLossDiamond || 0,
        //                                     grossLoss: roundToTwo(grossLossGold),
        //                                     tmProductionDiamondPieces: emp.tmProductionDiamondPieces || 0,
        //                                     grossLossDiamondPieces: emp.grossLossDiamondPieces || 0,
        //                                     loss: emp.loss || 0,
        //                                     netLoss: roundToTwo(netLossGold),
        //                                     recovery: emp.recovery || 0,
        //                                     date: emp.date || "N/A",
        //                                     tmGrossLossWeight: roundToTwo(goldRecoveryWeight)
        //                                 };
        //                             })
        //                         };
        //                     });
        //                 }
        //             }
        //         } else {
        //             showNoDataPopup.value = true;
        //             setTimeout(() => {
        //                 showNoDataPopup.value = false;
        //                 selectedDateRange.value = getDefaultDateRange();
        //             }, 3000);
        //         }
        //     } catch (err) {
        //         console.error("Error fetching efficiency analysis data:", err);
        //         showNoDataPopup.value = true;
        //         setTimeout(() => {
        //             showNoDataPopup.value = false;
        //             selectedDateRange.value = getDefaultDateRange();
        //         }, 3000);
        //     } finally {
        //         loading.value = false;
        //     }
        // };
        const maxRetries = 1; // Prevent infinite loop
        let retryCount = 0;
        const fetchEfficiencyAnalysisData = async (locationId = null) => {
            try {
                loading.value = true;
                showNoDataPopup.value = false;

                if (!selectedDateRange.value || selectedDateRange.value.length < 2) return;

                const formatDate = (date) => {
                    const offset = date.getTimezoneOffset();
                    date = new Date(date.getTime() - (offset * 60 * 1000));
                    return date.toISOString().split('T')[0];
                };

                const formattedStartDate = formatDate(selectedDateRange.value[0]);
                const formattedEndDate = formatDate(selectedDateRange.value[1]);

                // Fetch Efficiency Analysis Data (Overall - All Operations)
                const isRepairOnly = props.type === 'repair' ? true : false;
                await fetchListEfficiencyAnalysis(locationId, formattedStartDate, formattedEndDate, isRepairOnly);
                
                // ✅ COMPREHENSIVE CONSOLE LOGS FOR FETCHED DATA
                console.log("\n" + "=".repeat(60));
                console.log("🔵 EFFICIENCY ANALYSIS DATA FETCH - FRONTEND CONSOLE");
                console.log("=".repeat(60));
                console.log("📅 Date Range:", formattedStartDate, "to", formattedEndDate);
                console.log("📍 Location ID:", locationId || "All Locations");
                console.log("=".repeat(60));
                
                // Raw API Response
                console.log("\n📊 RAW API RESPONSE (listEfficiencyData):");
                console.log(JSON.stringify(listEfficiencyData.value, null, 2));
                
                if (listEfficiencyData.value && Object.keys(listEfficiencyData.value).length > 0) {

                    if (!locationId) {
                        // ✅ Updating all locations with departments, employees, and bag counts
                        locations.value = Object.entries(listEfficiencyData.value).map(([locId, locData]) => ({
                            internalid: { value: locId },
                            name: { value: locData.location_name },
                            departments: Object.entries(locData.departments || {}).map(([deptId, dept]) => {
                                return {
                                    id: deptId,
                                    name: dept.department_name,
                                    bag_count: dept.bag_count || 0,
                                    unique_bags_array: dept.unique_bags_array || [],
                                    category_count: dept.category_count || 0,
                                    unique_categories_array: dept.unique_categories_array || [],
                                    starting_qty: dept.starting_qty || 0,
                                    loss_qty: dept.loss_qty || 0,
                                    category_qty_map: dept.category_qty_map || {},
                                    category_print_design_map: dept.category_print_design_map || {},
                                    category_bag_count_map: dept.category_bag_count_map || {},
                                    employees: (dept.employees_array || []).map(emp => {
                                        // Build category_qty_map from categories array
                                        const categoryQtyMap = {};
                                        if (emp.categories && Array.isArray(emp.categories)) {
                                            emp.categories.forEach(cat => {
                                                const key = `${emp.employee_id}_${cat.category_name}`;
                                                categoryQtyMap[key] = {
                                                    starting_qty_gold: cat.starting_qty_gold || 0,
                                                    starting_qty_diamond: cat.starting_qty_diamond || 0,
                                                    issued_qty_gold: cat.issued_qty_gold || 0,
                                                    issued_qty_diamond: cat.issued_qty_diamond || 0,
                                                    loss_qty_gold: cat.loss_qty_gold || 0,
                                                    loss_qty_diamond: cat.loss_qty_diamond || 0,
                                                    scrap_qty_gold: cat.scrap_qty_gold || 0,
                                                    scrap_qty_diamond: cat.scrap_qty_diamond || 0,
                                                    balance_qty_gold: cat.balance_qty_gold || 0,
                                                    balance_qty_diamond: cat.balance_qty_diamond || 0
                                                };
                                            });
                                        }
                                        
                                        const empObj = {
                                            id: emp.employee_id,
                                            name: emp.name,
                                            bag_count: emp.bag_count || 0,
                                            unique_bags_array: emp.unique_bags_array || [],
                                            category_count: emp.category_count || 0,
                                            unique_categories_array: emp.unique_categories_array || [],
                                            starting_qty: emp.starting_qty || 0,
                                            loss_qty: emp.loss_qty || 0,
                                            categories: emp.categories || [],
                                            category_qty_map: categoryQtyMap,
                                            category_print_design_map: emp.category_print_design_map || {},
                                            category_bag_count_map: emp.category_bag_count_map || {}
                                        };
                                        return empObj;
                                    })
                                };
                            })
                        }));

                        // ✅ DETAILED CONSOLE LOGS - STRUCTURED DATA
                        console.log("\n📍 PROCESSED LOCATIONS DATA:");
                        console.log("─".repeat(60));
                        locations.value.forEach((loc, locIdx) => {
                            console.log(`\n[Location ${locIdx + 1}] ${loc.name.value}`);
                            console.log(`Located ID: ${loc.internalid.value}`);
                            
                            loc.departments.forEach((dept, deptIdx) => {
                                console.log(`\n  [Department ${deptIdx + 1}] ${dept.name} (ID: ${dept.id})`);
                                console.log(`    Total Bags: ${dept.bag_count}`);
                                console.log(`    Unique Bags: [${dept.unique_bags_array.join(', ')}]`);
                                console.log(`    Total Categories: ${dept.category_count}`);
                                console.log(`    Unique Categories: [${dept.unique_categories_array.join(', ')}]`);
                                console.log(`    Department Starting Qty: ${dept.starting_qty}`);
                                console.log(`    Department Loss Qty: ${dept.loss_qty}`);
                                console.log(`    Category Qty Map:`, dept.category_qty_map);
                                console.log(`    Category Print Design Map:`, dept.category_print_design_map);
                                console.log(`    Total Employees: ${dept.employees.length}`);
                                
                                dept.employees.forEach((emp, empIdx) => {
                                    console.log(`\n    [Employee ${empIdx + 1}] ${emp.name} (ID: ${emp.id})`);
                                    console.log(`      Bag Count: ${emp.bag_count}`);
                                    console.log(`      Unique Bags: [${emp.unique_bags_array.join(', ')}]`);
                                    console.log(`      Category Count: ${emp.category_count}`);
                                    console.log(`      Unique Categories: [${emp.unique_categories_array.join(', ')}]`);
                                    console.log(`      Starting Qty: ${emp.starting_qty}`);
                                    console.log(`      Loss Qty: ${emp.loss_qty}`);
                                    console.log(`      Categories Detail:`, emp.categories);
                                    console.log(`      Category Qty Map:`, emp.category_qty_map);
                                });
                            });
                        });
                        console.log("\n" + "─".repeat(60));
                        
                        // ✅ SUMMARY STATISTICS
                        console.log("\n📈 FETCH SUMMARY:");
                        console.log("─".repeat(60));
                        let totalDepts = 0, totalEmps = 0, totalBags = 0, totalCategories = 0;
                        locations.value.forEach(loc => {
                            loc.departments.forEach(dept => {
                                totalDepts++;
                                totalBags += dept.bag_count;
                                totalCategories += dept.category_count;
                                totalEmps += dept.employees.length;
                            });
                        });
                        console.log(`✅ Total Locations: ${locations.value.length}`);
                        console.log(`✅ Total Departments: ${totalDepts}`);
                        console.log(`✅ Total Employees: ${totalEmps}`);
                        console.log(`✅ Total Bags: ${totalBags}`);
                        console.log(`✅ Total Unique Categories: ${totalCategories}`);
                        console.log("─".repeat(60));
                        console.log("🟢 DATA FETCH COMPLETE - Ready for UI display");
                        console.log("=".repeat(60) + "\n");
                    }

                    isInitialLoading.value = false;
                } else {
                    console.warn("❌ NO DATA FOUND for the selected date range");
                    showNoDataPopup.value = true;
                    isInitialLoading.value = false;
                }

                loading.value = false;
            } catch (error) {
                console.error('Error fetching efficiency analysis data:', error);
                loading.value = false;
                isInitialLoading.value = false;
                showNoDataPopup.value = true;
            }
        };

        // Function to close no data popup
        const closeNoDataPopup = () => {
            console.log("Closing No Data Popup");
            showNoDataPopup.value = false;
            selectedDateRange.value = getDefaultDateRange(); // Reset date filter value
        };

        const formatDate = (date) => {
            const offset = date.getTimezoneOffset();
            date = new Date(date.getTime() - (offset * 60 * 1000)); // Adjust for timezone offset
            return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        };

        // Watch for changes in the selected date range and re-fetch data
        watch(selectedDateRange, async (newRange) => {
            if (newRange && newRange.length === 2) {
                console.log("Date Range Changed:", newRange);
                const formattedStartDate = formatDate(newRange[0]);
                const formattedEndDate = formatDate(newRange[1]);

                console.log(`Date Range Changed: ${formattedStartDate} - ${formattedEndDate}`);

                if (expandedLocation.value) {
                    await fetchEfficiencyAnalysisData(expandedLocation.value);

                    const selectedLocation = locations.value.find(loc => loc.internalid.value === expandedLocation.value);

                    if (showDepartments.value) {
                        selectedDepartments.value = selectedLocation?.departments || [];
                        selectedDepartmentData.value = [...selectedDepartments.value];
                    }
                    if (showEmployees.value) {
                        selectedEmployees.value = selectedDepartments.value
                            .find(dept => dept.name === expandedDepartment.value)?.employees || [];
                    }
                } else {
                    await fetchEfficiencyAnalysisData();
                }

                updateCharts(); // Ensure charts are updated with new data
            }
        });



        // Function to toggle location view and fetch department data
        const toggleLocationView = async (locationId) => {
            if (expandedLocation.value == locationId) {
                expandedLocation.value = null;
                expandedDepartment.value = null;
                showDepartments.value = false;
                showEmployees.value = false;
                showTable.value = false;
                dashboardTitle.value = baseTitle;
                updateCharts();
            } else {
                expandedLocation.value = locationId;
                expandedDepartment.value = null;
                showDepartments.value = true;
                showEmployees.value = false;
                showTable.value = true;
                showEmployeesTable.value = false;
                dashboardTitle.value = "Department Details";

                await fetchEfficiencyAnalysisData(locationId);

                const selectedLocation = locations.value.find(loc => loc.internalid.value === locationId);
                selectedDepartments.value = [...(selectedLocation?.departments || [])]; // Force reactivity
                
                // Set department data with calculated bag counts
                selectedDepartmentData.value = [...selectedDepartments.value];

                // Log departments with bag counts and unique bag names
                let deptLogMsg = "=== DEPARTMENTS WITH BAG COUNTS ===\n";
                selectedDepartments.value.forEach(dept => {
                    const bagNames = dept.unique_bags_array || [];
                    const categoryNames = dept.unique_categories_array || [];
                    deptLogMsg += `Dept: ${dept.name} | Bag Count: ${dept.bag_count || 0} | Category Count: ${dept.category_count || 0} | Bags: [${bagNames.join(', ')}] | Categories: [${categoryNames.join(', ')}]\n`;
                });
                deptLogMsg += "===================================";
                console.log(deptLogMsg);
                
                updateCharts();
            }
        };


        // Function to toggle department view and fetch employee data
        const toggleDepartmentView = (deptName) => {
            if (expandedDepartment.value === deptName) {
                expandedDepartment.value = null;
                showEmployees.value = false;
                showEmployeesTable.value = false;
                dashboardTitle.value = "Department Details";

            } else {
                expandedDepartment.value = deptName;
                showEmployees.value = true;
                showEmployeesTable.value = true;
                dashboardTitle.value = "Employee Details";

                // Get employees from the already-populated selectedDepartments
                const selectedDept = selectedDepartments.value.find(dept => dept.name === deptName);
                
                console.log(`\n🔵 TOGGLE DEPARTMENT VIEW - ${deptName}`);
                console.log(`Selected Department:`, selectedDept);
                console.log(`Employees Array:`, selectedDept?.employees);
                
                // Add department ID to each employee
                selectedEmployees.value = (selectedDept?.employees || []).map(emp => {
                    return {
                        ...emp,
                        departmentId: selectedDept.id
                    };
                });
                
                console.log(`✅ selectedEmployees populated with ${selectedEmployees.value.length} employees`);
                console.log(`📋 Employee Details:`, selectedEmployees.value);
                console.log(`Department: ${deptName} (ID: ${selectedDept?.id}) - Employees:`, selectedEmployees.value);
            }
            updateCharts();
        };


        // const updateCharts = () => {
        //     setTimeout(() => {
        //         let labels, datasets;
        //         let productionLabels = [];
        //         let productionValues = [];

        //         if (!showDepartments.value && !showEmployees.value) {
        //             // ✅ Line Chart for Overall Location-based Data
        //             labels = locations.value.map(loc => loc.name.value);
        //             let goldProductionData = locations.value.map(loc => parseInt(loc.tmproduction_gold || 0));
        //             let goldLossData = locations.value.map(loc => parseInt(loc.loss_gold || 0));
        //             let diamondProductionData = locations.value.map(loc => parseInt(loc.tmproduction_diamond || 0));
        //             let diamondLossData = locations.value.map(loc => parseInt(loc.loss_diamond || 0));
        //             let diamondProductionPiecesData = locations.value.map(loc => parseInt(loc.tmproduction_diamond_pieces || 0));
        //             let diamondLossPiecesData = locations.value.map(loc => parseInt(loc.loss_diamond_pieces || 0));

        //             datasets = [
        //                 {
        //                     label: "Gold Production (g)",
        //                     data: goldProductionData,
        //                     borderColor: "#B59E5F",
        //                     backgroundColor: "rgba(181, 158, 95, 0.2)",
        //                     fill: true,
        //                     tension: 0.4,
        //                 },
        //                 {
        //                     label: "Gold Loss (g)",
        //                     data: goldLossData,
        //                     borderColor: "#D9A066",
        //                     backgroundColor: "rgba(217, 160, 102, 0.2)",
        //                     fill: true,
        //                     tension: 0.4,
        //                 },
        //                 {
        //                     label: "Diamond Production (cts)",
        //                     data: diamondProductionData,
        //                     borderColor: "#7092BE",
        //                     backgroundColor: "rgba(112, 146, 190, 0.2)",
        //                     fill: true,
        //                     tension: 0.4,
        //                 },
        //                 {
        //                     label: "Diamond Loss (cts)",
        //                     data: diamondLossData,
        //                     borderColor: "#A0B9D9",
        //                     backgroundColor: "rgba(160, 185, 217, 0.2)",
        //                     fill: true,
        //                     tension: 0.4,
        //                 },
        //                 {
        //                     label: "Diamond Production (pieces)",
        //                     data: diamondProductionPiecesData,
        //                     borderColor: "#5B7C99",
        //                     backgroundColor: "rgba(91, 124, 153, 0.2)",
        //                     fill: true,
        //                     tension: 0.4,
        //                 },
        //                 {
        //                     label: "Diamond Loss (pieces)",
        //                     data: diamondLossPiecesData,
        //                     borderColor: "#7F9FB9",
        //                     backgroundColor: "rgba(127, 159, 185, 0.2)",
        //                     fill: true,
        //                     tension: 0.4,
        //                 }
        //             ];

        //             // ✅ Doughnut Chart for Overall Production
        //             productionLabels = ["Gold Production", "Diamond Production (cts)", "Diamond Production (pieces)"];
        //             productionValues = [
        //                 locations.value.reduce((sum, loc) => sum + parseInt(loc.tmproduction_gold || 0), 0),
        //                 locations.value.reduce((sum, loc) => sum + parseInt(loc.tmproduction_diamond || 0), 0),
        //                 locations.value.reduce((sum, loc) => sum + parseInt(loc.tmproduction_diamond_pieces || 0), 0)
        //             ];

        //         } else if (showDepartments.value && !showEmployees.value) {
        //             // ✅ Department-specific Line Chart
        //             labels = selectedDepartments.value.map(dept => dept.name);
        //             let productionData = selectedDepartments.value.map(dept => parseInt(dept.production || 0));
        //             let lossData = selectedDepartments.value.map(dept => parseInt(dept.loss || 0));

        //             datasets = [
        //                 {
        //                     label: "Production",
        //                     data: productionData,
        //                     borderColor: "#10B981",
        //                     backgroundColor: "rgba(16,185,129,0.2)",
        //                     fill: true,
        //                     tension: 0.4,
        //                 },
        //                 {
        //                     label: "Loss",
        //                     data: lossData,
        //                     borderColor: "#DC2626",
        //                     backgroundColor: "rgba(220,38,38,0.2)",
        //                     fill: true,
        //                     tension: 0.4,
        //                 }
        //             ];

        //             // ✅ Doughnut Chart Uses Department Data
        //             productionLabels = selectedDepartments.value.map(dept => dept.name);
        //             productionValues = selectedDepartments.value.map(dept => parseInt(dept.production || 0));
        //         } else {
        //             // ✅ Employee-specific Line Chart
        //             labels = selectedEmployees.value.map(emp => emp.name);
        //             let productionData = selectedEmployees.value.map(emp => parseFloat(emp.tmProduction || 0));
        //             let lossData = selectedEmployees.value.map(emp => parseFloat(emp.loss || 0));

        //             datasets = [
        //                 {
        //                     label: "Production",
        //                     data: productionData,
        //                     borderColor: "#10B981",
        //                     backgroundColor: "rgba(16,185,129,0.2)",
        //                     fill: true,
        //                     tension: 0.4,
        //                 },
        //                 {
        //                     label: "Loss",
        //                     data: lossData,
        //                     borderColor: "#DC2626",
        //                     backgroundColor: "rgba(220,38,38,0.2)",
        //                     fill: true,
        //                     tension: 0.4,
        //                 }
        //             ];

        //             // ✅ Doughnut Chart Uses Employee Data
        //             productionLabels = selectedEmployees.value.map(emp => emp.name);
        //             productionValues = selectedEmployees.value.map(emp => parseInt(emp.tmProduction || 0));
        //         }

        //         // ✅ Line Chart for `cryptoChart`
        //         const ctx1 = document.getElementById('cryptoChart')?.getContext('2d');
        //         if (ctx1) {
        //             if (cryptoChart) cryptoChart.destroy();
        //             cryptoChart = new Chart(ctx1, {
        //                 type: "line",
        //                 data: {
        //                     labels: labels,
        //                     datasets: datasets
        //                 },
        //                 options: {
        //                     responsive: true,
        //                     maintainAspectRatio: false,
        //                     plugins: {
        //                         legend: { display: true, position: 'top' },
        //                         tooltip: { enabled: true }
        //                     },
        //                     scales: {
        //                         y: {
        //                             beginAtZero: true,
        //                             grid: { color: "#D1D5DB" }
        //                         },
        //                         x: {
        //                             grid: { color: "#D1D5DB" }
        //                         }
        //                     }
        //                 }
        //             });
        //         }

        //         // ✅ Doughnut Chart for `productionChart`
        //         const ctx2 = document.getElementById('productionChart')?.getContext('2d');
        //         if (ctx2) {
        //             if (productionChart) productionChart.destroy();
        //             productionChart = new Chart(ctx2, {
        //                 type: "doughnut",
        //                 data: {
        //                     labels: productionLabels,
        //                     datasets: [{
        //                         data: productionValues,
        //                         backgroundColor: ["#3B82F6", "#F59E0B", "#8B5CF6", "#14B8A6", "#EF4444"], // New Colors

        //                         hoverOffset: 10
        //                     }]
        //                 },
        //                 options: {
        //                     responsive: true,
        //                     maintainAspectRatio: false,
        //                     plugins: {
        //                         legend: { display: true, position: 'right' },
        //                         tooltip: { enabled: true }
        //                     }
        //                 }
        //             });
        //         }
        //     }, 500);
        // };

        const updateCharts = () => {
            setTimeout(() => {
                let labels, datasets;
                let productionLabels = [];
                let productionValues = [];
                let chartType = "line"; // Default is Line Chart

                if (!showDepartments.value && !showEmployees.value) {
                    // ✅ Use Bar Chart for Locations
                    chartType = "bar";
                    labels = locations.value.map(loc => loc.name.value);
                    let goldProductionData = locations.value.map(loc => parseInt(loc.tmproduction_gold || 0));
                    let goldLossData = locations.value.map(loc => parseInt(loc.loss_gold || 0));
                    let diamondProductionData = locations.value.map(loc => parseInt(loc.tmproduction_diamond || 0));
                    let diamondLossData = locations.value.map(loc => parseInt(loc.loss_diamond || 0));
                    let diamondProductionPiecesData = locations.value.map(loc => parseInt(loc.tmproduction_diamond_pieces || 0));
                    let diamondLossPiecesData = locations.value.map(loc => parseInt(loc.loss_diamond_pieces || 0));

                    datasets = [
                        {
                            label: "Gold Production (g)",
                            data: goldProductionData,
                            backgroundColor: "#B59E5F",
                        },
                        {
                            label: "Gold Loss (g)",
                            data: goldLossData,
                            backgroundColor: "#D9A066",
                        },
                        {
                            label: "Diamond Production (cts)",
                            data: diamondProductionData,
                            backgroundColor: "#7092BE",
                        },
                        {
                            label: "Diamond Loss (cts)",
                            data: diamondLossData,
                            backgroundColor: "#A0B9D9",
                        },
                        {
                            label: "Diamond Production (pieces)",
                            data: diamondProductionPiecesData,
                            backgroundColor: "#5B7C99",
                        },
                        {
                            label: "Diamond Loss (pieces)",
                            data: diamondLossPiecesData,
                            backgroundColor: "#7F9FB9",
                        }
                    ];

                    // ✅ Doughnut Chart for Overall Production
                    productionLabels = ["Gold Production", "Diamond Production (cts)", "Diamond Production (pieces)"];
                    productionValues = [
                        locations.value.reduce((sum, loc) => sum + parseInt(loc.tmproduction_gold || 0), 0),
                        locations.value.reduce((sum, loc) => sum + parseInt(loc.tmproduction_diamond || 0), 0),
                        locations.value.reduce((sum, loc) => sum + parseInt(loc.tmproduction_diamond_pieces || 0), 0)
                    ];
                } else if (showDepartments.value && !showEmployees.value) {
                    // ✅ Department-specific Line Chart
                    labels = selectedDepartments.value.map(dept => dept.name);
                    let productionData = selectedDepartments.value.map(dept => parseInt(dept.production || 0));
                    let lossData = selectedDepartments.value.map(dept => parseInt(dept.loss || 0));

                    datasets = [
                        {
                            label: "Production",
                            data: productionData,
                            borderColor: "#10B981",
                            backgroundColor: "rgba(16,185,129,0.2)",
                            fill: true,
                            tension: 0.4,
                        },
                        {
                            label: "Loss",
                            data: lossData,
                            borderColor: "#DC2626",
                            backgroundColor: "rgba(220,38,38,0.2)",
                            fill: true,
                            tension: 0.4,
                        }
                    ];

                    // ✅ Doughnut Chart Uses Department Data
                    productionLabels = selectedDepartments.value.map(dept => dept.name);
                    productionValues = selectedDepartments.value.map(dept => parseInt(dept.production || 0));
                } else {
                    // ✅ Employee-specific Line Chart
                    labels = selectedEmployees.value.map(emp => emp.name);
                    let productionData = selectedEmployees.value.map(emp => parseFloat(emp.tmProduction || 0));
                    let lossData = selectedEmployees.value.map(emp => parseFloat(emp.loss || 0));

                    datasets = [
                        {
                            label: "Production",
                            data: productionData,
                            borderColor: "#10B981",
                            backgroundColor: "rgba(16,185,129,0.2)",
                            fill: true,
                            tension: 0.4,
                        },
                        {
                            label: "Loss",
                            data: lossData,
                            borderColor: "#DC2626",
                            backgroundColor: "rgba(220,38,38,0.2)",
                            fill: true,
                            tension: 0.4,
                        }
                    ];

                    // ✅ Doughnut Chart Uses Employee Data
                    productionLabels = selectedEmployees.value.map(emp => emp.name);
                    productionValues = selectedEmployees.value.map(emp => parseInt(emp.tmProduction || 0));
                }

                // ✅ Dynamic Chart Type for `cryptoChart`
                const ctx1 = document.getElementById('cryptoChart')?.getContext('2d');
                if (ctx1) {
                    if (cryptoChart) cryptoChart.destroy();
                    cryptoChart = new Chart(ctx1, {
                        type: chartType,  // <-- Dynamically switch between "bar" and "line"
                        data: {
                            labels: labels,
                            datasets: datasets
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: true, position: 'top' },
                                tooltip: { enabled: true }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: { color: "#D1D5DB" }
                                },
                                x: {
                                    grid: { color: "#D1D5DB" }
                                }
                            }
                        }
                    });
                }

                // ✅ Doughnut Chart for `productionChart`
                const ctx2 = document.getElementById('productionChart')?.getContext('2d');
                if (ctx2) {
                    if (productionChart) productionChart.destroy();
                    productionChart = new Chart(ctx2, {
                        type: "doughnut",
                        data: {
                            labels: productionLabels,
                            datasets: [{
                                data: productionValues,
                                backgroundColor: ["#3B82F6", "#F59E0B", "#8B5CF6", "#14B8A6", "#EF4444"], // New Colors
                                hoverOffset: 10
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: true, position: 'right' },
                                tooltip: { enabled: true }
                            }
                        }
                    });
                }
            }, 500);
        };



        onMounted(async () => {
            await fetchLocations();  // Ensure locations are loaded
            await fetchEfficiencyAnalysisData();  // Ensure efficiency data is loaded
            setTimeout(() => {
                updateCharts();  // Delay execution to allow DOM to be ready
            }, 500);
        });



        return {
            expandedLocation,
            expandedDepartment,
            showDepartments,
            showEmployees,
            loading,
            dashboardTitle,
            locations,
            selectedDepartments,
            selectedEmployees,
            toggleLocationView,
            toggleDepartmentView,
            showTable,
            selectedDepartmentData,
            showEmployeesTable,
            selectedDateRange,
            isInitialLoading,
            showNoDataPopup,
            selectedDateRange,
            closeNoDataPopup,
            downloadData,
            formatName,
            roundToTwo,
            getLocationTotalBagCount,
            getLocationTotalActualProductionGold,
            getLocationTotalActualProductionDiamond,
            getLocationTotalIssuedQtyGold,
            getLocationTotalIssuedQtyDiamond,
            getLocationTotalLossQtyGold,
            getLocationTotalLossQtyDiamond,
            getLocationTotalIssuedPiecesDiamond,
            getLocationTotalLossPiecesDiamond,
            getDepartmentTotalIssuedQtyGold,
            getDepartmentTotalIssuedQtyDiamond,
            getDepartmentTotalLossQtyGold,
            getDepartmentTotalLossQtyDiamond,
            getEmployeeTotalIssuedQtyGold,
            getEmployeeTotalIssuedQtyDiamond,
            getEmployeeTotalLossQtyGold,
            getEmployeeTotalLossQtyDiamond,
            getEmployeeTotalActualProductionGold,
            getEmployeeTotalActualProductionDiamond,
            getEmployeeTotalStartingQtyAllCategories,
            getEmployeeTotalIssuedQtyAllCategories,
            getEmployeeTotalLossQtyAllCategories,
            getDepartmentTotalActualProductionGold,
            getDepartmentTotalActualProductionDiamond,
            getDepartmentTotalIssuedPiecesDiamond,
            getDepartmentTotalLossPiecesDiamond,
            getEmployeeTotalIssuedPiecesDiamond,
            getEmployeeTotalLossPiecesDiamond,
            getCategoryStartingQty,
            getCategoryStartingQtyGold,
            getCategoryStartingQtyGoldRaw,
            getCategoryStartingQtyDiamond,
            getCategoryStartingQtyDiamondRaw,
            getCategoryIssuedQty,
            getCategoryIssuedQtyGold,
            getCategoryIssuedQtyGoldRaw,
            getCategoryIssuedQtyDiamond,
            getCategoryIssuedQtyDiamondRaw,
            getCategoryLossQty,
            getCategoryLossQtyGold,
            getCategoryLossQtyGoldRaw,
            getCategoryLossQtyDiamond,
            getCategoryLossQtyDiamondRaw,
            getCategoryScrapQty,
            getCategoryScrapQtyGold,
            getCategoryScrapQtyGoldRaw,
            getCategoryScrapQtyDiamond,
            getCategoryScrapQtyDiamondRaw,
            getCategoryBalanceQty,
            getCategoryBalanceQtyGold,
            getCategoryBalanceQtyGoldRaw,
            getCategoryBalanceQtyDiamond,
            getCategoryBalanceQtyDiamondRaw,
            totalDeptActualProductionGold,
            totalDeptGrossLossGold,
            totalDeptActualProductionDiamond,
            totalDeptGrossLossDiamond,
            totalDeptGoldRecoveryWeight,
            totalDeptNetLossGold,
            totalDeptTmProductionGold,
            totalDeptTmProductionDiamond,
            totalDeptBagCount,
            totalDeptStartingQuantityGold,
            totalDeptStartingQuantityDiamond,
            totalDeptIssuedQtyGold,
            totalDeptLossQtyGold,
            totalDeptIssuedQtyDiamond,
            totalDeptLossQtyDiamond,
            totalEmpActualProductionGold,
            totalEmpGrossLossGold,
            totalEmpActualProductionDiamond,
            totalEmpGrossLossDiamond,
            totalEmpGoldRecoveryWeight,
            totalEmpNetLossGold,
            totalEmpTmProductionGold,
            totalEmpTmProductionDiamond,
            totalEmpBagCount,
            totalEmpStartingQuantityGold,
            totalEmpIssuedQuantityGold,
            totalEmpLossQuantityGold,
            totalEmpStartingQuantityDiamond,
            totalEmpIssuedQuantityDiamond,
            totalEmpLossQuantityDiamond,
            totalEmpActualProductionGoldCalculated,
            totalEmpActualProductionDiamondCalculated,
            showNoDataMessage,
            fetchEfficiencyAnalysisData,
            calculateGoldLossPercentage,
            calculateDiamondLossPercentage,
            getEmployeeCategoryStartingQty,
            getEmployeeCategoryStartingQtyGold,
            getEmployeeCategoryStartingQtyGoldRaw,
            getEmployeeCategoryStartingQtyDiamond,
            getEmployeeCategoryStartingQtyDiamondRaw,
            getEmployeeCategoryIssuedQty,
            getEmployeeCategoryIssuedQtyGold,
            getEmployeeCategoryIssuedQtyGoldRaw,
            getEmployeeCategoryIssuedQtyDiamond,
            getEmployeeCategoryIssuedQtyDiamondRaw,
            getEmployeeCategoryLossQty,
            getEmployeeCategoryLossQtyGold,
            getEmployeeCategoryLossQtyGoldRaw,
            getEmployeeCategoryLossQtyDiamond,
            getEmployeeCategoryLossQtyDiamondRaw,
            getEmployeeCategoryScrapQty,
            getEmployeeCategoryScrapQtyGold,
            getEmployeeCategoryScrapQtyGoldRaw,
            getEmployeeCategoryScrapQtyDiamond,
            getEmployeeCategoryScrapQtyDiamondRaw,
            getEmployeeCategoryBalanceQty,
            getEmployeeCategoryBalanceQtyGold,
            getEmployeeCategoryBalanceQtyGoldRaw,
            getEmployeeCategoryBalanceQtyDiamond,
            getEmployeeCategoryBalanceQtyDiamondRaw


        };
    }
};
</script>



<style scoped>

/* ✅ Date Picker Container */
:deep(.dp__menu) {
    border-radius: 12px;
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15);
    padding: 10px;
    border: 1px solid #e5e7eb;
}

/* ✅ Selected Date (Gray Background) */
:deep(.dp__active_date) {
    background-color: #4a4a4b !important;
    /* Dark Gray */
    color: white !important;
    border-radius: 6px;
    font-weight: bold;
    transition: all 0.2s ease-in-out;
}

/* ✅ Today’s Date (Outlined Circle) */
:deep(.dp__today) {
    border: 2px solid #b0b0b3 !important;
    /* Medium Gray */
    border-radius: 50%;
    font-weight: bold;
    color: #909195 !important;
}

/* ✅ Selected Date (Start and End - Fully Rounded) */
:deep(.dp__range_start) {
    background-color: #e3e3f1 !important;
    /* Dark Gray */
    color: white !important;
    border-radius: 50% !important;
    /* Fully rounded */
    font-weight: bold;
}

/* ✅ Selected Date (Start and End - Fully Rounded) */
:deep(.dp__range_end) {
    background-color: #e3e3f1 !important;
    /* Dark Gray */
    color: white !important;
    border-radius: 50% !important;
    /* Fully rounded */
    font-weight: bold;
}

/* ✅ Range Between (Softer Gray Background, No Rounded Borders) */
:deep(.dp__range_between) {
    background-color: rgba(120, 120, 120, 0.2) !important;
    /* Light Gray */
    color: #5a5c64 !important;
    border-radius: 0px !important;
    /* Remove rounding */
}

/* ✅ Hover Effect */
:deep(.dp__range_between:hover) {
    background-color: rgba(90, 90, 90, 0.3) !important;
}


/* ✅ Navigation Arrows */
:deep(.dp__pointer) {
    color: #5a5a5b !important;
    /* Dark Gray */
    transition: transform 0.2s ease-in-out;
}



/* ✅ Calendar Header */
:deep(.dp__month_year_row) {
    font-weight: bold;
    color: #5a5a5b;
    /* Dark Gray */
}

/* ✅ Weekday Headers */
:deep(.dp__weekday_header) {
    font-weight: bold;
    color: #6b6d6f;
    /* Medium Gray */
}

/* ✅ Date Picker Input Box */
.custom-datepicker {

    /* Adjust width to match UI */
    padding: 10px 14px;
    font-size: 8px;

    /* Dark gray background */

    /* Darker border */
    border-radius: 25px;
    /* Rounded corners */
    color: #ffffff;

}



/* Hide scrollbar but keep scrolling functionality */
.scrollbar-hidden::-webkit-scrollbar {
    width: 0px;
    display: none;
}

.scrollbar-hidden {
    scrollbar-width: none;
    /* For Firefox */
}


.chart-container {
    width: 100%;
    height: 100%;
    /* or set a specific height for your needs */
}

.table-container {
    max-width: 100%;
    overflow-x: auto;
}

table {
    width: 100%;
    font-size: 12px;
    /* Reduced font size */
    border-spacing: 0;
    border-collapse: collapse;
}

th,
td {
    padding: 6px 8px;
    /* Reduced padding */
    text-align: left;
    border: 1px solid #E5E7EB;
}

th {
    font-weight: 600;
    background-color: #F3F4F6;
    text-transform: uppercase;
    color: #374151;
}

tr:hover {
    background-color: #F9FAFB;
}
</style>

<style>
@media (max-width: 1508px) {
    .main-card-grid {
        grid-template-columns: repeat(4, minmax(100px, 1fr)) !important;
    }
}
@media (max-width: 1271px) {
    .main-card-grid {
        grid-template-columns: repeat(3, minmax(100px, 1fr)) !important;
    }
}
@media (max-width: 1046px) {
    .main-card-grid {
        grid-template-columns: repeat(2, minmax(100px, 1fr)) !important;
    }
}
@media (max-width: 802px) {
    .main-card-grid {
        grid-template-columns: repeat(1, minmax(100px, 1fr)) !important;
    }
}
</style>