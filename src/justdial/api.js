import axios from "axios";

const api = axios.create({
    baseURL: 'https://jd.d0s369.co.in/api/jd-invoices' || 'http://localhost:5000/api/jd-invoices',
});

export default api;

const getJDInvoices = async (page, limit, month = '') => {
    let url = `/?page=${page}&limit=${limit}`;
    if (month) {
        url += `&month=${month}`;
    }
    const response = await api.get(url);
    return response.data;
}

const createJDInvoice = async (data) => {
    const response = await api.post('/', data);
    return response.data;
}

const updateJDInvoice = async (id, data) => {
    const response = await api.put(`/${id}`, data);
    return response.data;
}

const deleteJDInvoice = async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
}

export { getJDInvoices, createJDInvoice, updateJDInvoice, deleteJDInvoice };