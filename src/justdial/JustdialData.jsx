import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { getJDInvoices, deleteJDInvoice } from "./api";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const JustdialData = () => {
    const navigate = useNavigate();

    const [tableRows, setTableRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(15);
    const [selectedMonth, setSelectedMonth] = useState(''); // Format: YYYY-MM

    const user = localStorage.getItem("name");
    const role = localStorage.getItem("role");

    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            const response = await getJDInvoices(page, limit, selectedMonth); // Include month filter

            // Handle response structure properly
            if (response && response.data && Array.isArray(response.data)) {
                setTableRows(response.data);
                setCurrentPage(response.pagination?.currentPage || 1);
                setTotalPages(response.pagination?.totalPages || 1);
            } else {
                // Fallback in case of unexpected response structure
                setTableRows([]);
                setCurrentPage(1);
                setTotalPages(1);
                toast.error("Unexpected response format from server");
            }
        } catch (error) {
            setTableRows([]);
            setCurrentPage(1);
            setTotalPages(1);
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    useEffect(() => {
        // When limit changes, reset to page 1 and refetch
        fetchData(1);
        setCurrentPage(1);
    }, [limit]);

    useEffect(() => {
        // When month filter changes, reset to page 1 and refetch
        fetchData(1);
        setCurrentPage(1);
    }, [selectedMonth]);

    // Calculate totals from current tableRows
    const totals = tableRows.reduce((acc, row) => {
        const beforeAmount = acc.beforeAmount + (Number(row.beforeAmount) || 0);
        const tds = acc.tds + (Number(row.tds) || 0);
        const afterAmount = beforeAmount - tds;

        return { beforeAmount, tds, afterAmount };
    }, { beforeAmount: 0, tds: 0, afterAmount: 0 });

    const handleDelete = async (id) => {
        try {
            if (confirm("Are you sure you want to delete this JD Invoice?")) {
                toast.loading("Deleting JD Invoice...");
                await deleteJDInvoice(id);
                toast.dismiss();
                toast.success("JD Invoice deleted successfully!");
                fetchData(currentPage); // refresh same page
            }
        } catch (error) {
            toast.dismiss();
            toast.error(error.message || "Something went wrong");
        }
    };

    const handleExport = () => {
        if (!tableRows || tableRows.length === 0) return toast.error("No data to export");

        const headers = [
            "Sr No",
            "Date",
            "GST No",
            "SPA",
            "Location",
            "Days",
            "Before Amount",
            "TDS",
            "After Amount"
        ];

        const escapeCsv = (value) => {
            const str = String(value ?? "");
            return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
        };

        const rows = tableRows.map((row) => [
            row.srNo ?? "",
            (row.date ? row.date.split("T")[0] : ""),
            row.gstNo ?? "",
            row.spa ?? "",
            row.location ?? "",
            row.days ?? "",
            row.beforeAmount ?? "",
            row.tds ?? "",
            row.afterAmount ?? ""
        ]);

        const csv = [
            headers.map(escapeCsv).join(','),
            ...rows.map((r) => r.map(escapeCsv).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "justdial_invoices.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (!tableRows || tableRows.length === 0) return toast.error("No data to export");

        const doc = new jsPDF();

        // Title
        doc.setFontSize(16);
        doc.text("Justdial Invoices", 14, 15);

        // Format rows
        const rows = tableRows.map((row, index) => [
            index + 1,
            row.date ? row.date.split("T")[0] : "",
            row.gstNo ?? "",
            row.spa ?? "",
            row.location ?? "",
            row.days ?? "",
            row.beforeAmount ?? "",
            row.tds ?? "",
            row.afterAmount ?? ""
        ]);

        // Table
        autoTable(doc, {
            head: [["Sr No", "Date", "GST No", "SPA", "Location", "Days", "Before Amount", "TDS", "After Amount"]],
            body: rows,
            startY: 25,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185] },
        });

        // Totals section
        const finalY = doc.lastAutoTable?.finalY || 30;
        doc.setFontSize(12);
        doc.text("Totals:", 14, finalY + 10);
        doc.text(`Before Amount: ₹${totals.beforeAmount.toLocaleString()}`, 14, finalY + 20);
        doc.text(`TDS: ₹${totals.tds.toLocaleString()}`, 14, finalY + 30);
        doc.text(`After Amount: ₹${totals.afterAmount.toLocaleString()}`, 14, finalY + 40);

        doc.save("justdial_invoices.pdf");
    };


    const tableHeaders = [
        "Sr No", "Date", "GST No", "SPA", "Location", "Days",
        "Before Amount", "TDS", "After Amount", "Action"
    ];

    return (
        <>
            <section className={`${user == "mehul" || role == 'admin' ? "block" : "hidden "} max-w-11/12 mx-auto w-full p-6`}>
                <div className="flex flex-row justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold border-b-2">Justdial Data</h1>
                    <div className="flex gap-4 ">
                        <div className="text-black border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2">
                            <span>Filter by month</span>
                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1"
                            />
                            {selectedMonth && (
                                <button
                                    onClick={() => setSelectedMonth('')}
                                    className="text-red-500 hover:text-red-700 ml-1"
                                    title="Clear filter"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <div className="text-black border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2">
                            <span>Items per page</span>
                            <select value={String(limit)} onChange={(e) => {
                                const val = e.target.value;
                                setLimit(val === 'all' ? 'all' : Number(val));
                            }}>
                                <option value="15">15</option>
                                <option value="30">30</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="all">All</option>
                            </select>
                        </div>

                        <button
                            onClick={() => fetchData(currentPage)}
                            className="cursor-pointer text-black border border-gray-300 px-4 py-2 rounded-md"
                        >
                            Refresh
                        </button>
                        <button
                            onClick={handleExport}
                            className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md"
                        >
                            Export CSV
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded-md"
                        >
                            Export PDF
                        </button>
                        <button
                            onClick={() => navigate("/justdial/add")}
                            className={`${role == 'admin' ? 'hidden' : 'block'} cursor-pointer bg-green-500 text-white px-4 py-2 rounded-md`}
                        >
                            + Add
                        </button>
                    </div>
                </div>

                {/* Totals Display */}
                {tableRows.length > 0 && (
                    <div className="mb-4 p-2 bg-gray-50 border border-gray-300 rounded-md">
                        <h3 className="text-lg font-semibold mb-2">
                            Totals {selectedMonth && `for ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`}
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">Before Amount</p>
                                <p className="text-xl font-bold text-green-600">₹{totals.beforeAmount.toLocaleString()}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">TDS</p>
                                <p className="text-xl font-bold text-red-600">₹{totals.tds.toLocaleString()}</p>
                            </div>
                            <div className={`text-center`}>
                                <p className="text-sm font-medium text-gray-600">After Amount</p>
                                <p className="text-xl font-bold text-blue-600">₹{totals.afterAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                {tableHeaders.map((header, index) => (
                                    <th
                                        key={index}
                                        className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={tableHeaders.length} className="text-center py-4">
                                        Loading...
                                    </td>
                                </tr>
                            ) : !tableRows || tableRows.length === 0 ? (
                                <tr>
                                    <td colSpan={tableHeaders.length} className="text-center py-4">
                                        No data available.
                                    </td>
                                </tr>
                            ) : (
                                tableRows.map((row, rowIndex) => (
                                    <tr
                                        key={row._id}
                                        className="hover:bg-gray-50 transition"
                                    >
                                        <td className="border border-gray-300 px-4 py-2">{row.srNo}</td>
                                        <td className="border border-gray-300 px-4 py-2">{row.date?.split("T")[0] || "N/A"}</td>
                                        <td className="border border-gray-300 px-4 py-2">{row.gstNo}</td>
                                        <td className="border border-gray-300 px-4 py-2">{row.spa}</td>
                                        <td className="border border-gray-300 px-4 py-2">{row.location}</td>
                                        <td className="border border-gray-300 px-4 py-2">{row.days}</td>
                                        <td className="border border-gray-300 px-4 py-2">₹ {row.beforeAmount || "N/A"}</td>
                                        <td className="border border-gray-300 px-4 py-2">₹ {row.tds || "N/A"}</td>
                                        <td className="border border-gray-300 px-4 py-2">₹ {row.afterAmount || "N/A"}</td>
                                        <td className="border border-gray-300 px-4 py-2 text-blue-600">
                                            <div className={`${role == 'admin' ? 'hidden' : 'block'} flex flex-row gap-4`}>
                                                <button
                                                    onClick={() => navigate(`/justdial/edit/${row._id}`, { state: { row } })}
                                                    className="cursor-pointer hover:text-blue-800"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(row._id)}
                                                    className="cursor-pointer text-red-600 hover:text-red-800"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center mt-4 space-x-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="cursor-pointer px-3 py-1 bg-white border rounded">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="cursor-pointer px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </section>
        </>
    );
};

export default JustdialData;
