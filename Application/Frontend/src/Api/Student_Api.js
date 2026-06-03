const API_BASE = "http://127.0.0.1:3000";

// creating Student

const createStudent = async (data) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE}/api/student`, {
        method: "POST",
        headers: isFormData ? getFormHeaders() : getHeaders(),
        body: isFormData ? data : JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Create failed: ${response.status}`);
    return response.json();
};
export default createStudent;

//get all students

export const getAllStudents = async () => {
    const response = await fetch(`${API_BASE}/api/student`, {
        method: "GET",
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Get all failed: ${response.status}`);
    return response.json();
};

//update student

export const updateStudent = async (id, data) => {
    const isFormData = data instanceof FormData;
    const response = await fetch(`${API_BASE}/api/student/${id}`, {
        method: "PUT",
        headers: isFormData ? getFormHeaders() : getHeaders(),
        body: isFormData ? data : JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Update failed: ${response.status}`);
    return response.json();
};

//Delete student

export const deleteEmployee = async (id) => {
    const response = await fetch(`${API_BASE}/api/student/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
    return response.json();
};
