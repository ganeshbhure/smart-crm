export const loginUser = async (email, password) => {
    const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    return response.json();
};

export const getCustomers = async (page = 0, size = 5) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
        `http://localhost:8080/api/customers?page=${page}&size=${size}`,
        {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    const data = await res.json();

    // 🔥 IMPORTANT FIX
    return data;
};

export const addCustomer = async (customer) => {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:8080/api/customers", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(customer),
    });

    return response.json();
};

export const deleteCustomer = async (id) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:8080/api/customers/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token,
        },
    });

    return response;
};

export const registerUser = async (userData) => {
    const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error("Registration failed");
    }

    return response.json();
};

export const updateCustomer = async (id, customerData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:8080/api/customers/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(customerData)
    });

    if (!response.ok) {
        throw new Error("Update failed");
    }

    return response.json();
};

export const searchCustomers = async (query) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `http://localhost:8080/api/customers/search?name=${query}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {
        throw new Error("Search failed");
    }

    return response.json();
};

// 🔥 CONTACT APIs

export const getContacts = async (customerId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
        `http://localhost:8080/api/contacts/customer/${customerId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return res.json();
};

export const addContact = async (contact) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
        "http://localhost:8080/api/contacts",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(contact)
        }
    );

    return res.json();
};

// 🔥 NOTES APIs

export const getNotes = async (customerId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
        `http://localhost:8080/api/notes/customer/${customerId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return res.json();
};

export const addNote = async (customerId, note) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
        `http://localhost:8080/api/notes/customer/${customerId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(note)
        }
    );

    return res.json();
};

export const updateNoteStatus = async (noteId, status) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
        `http://localhost:8080/api/notes/${noteId}?status=${status}`,
        {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return res.json();
};

export const deleteNote = async (noteId) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
        `http://localhost:8080/api/notes/${noteId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return res;
};