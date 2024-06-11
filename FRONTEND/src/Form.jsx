import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Forms = ({ token }) => {
    const [forms, setForms] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [editing, setEditing] = useState(false);
    const [currentForm, setCurrentForm] = useState({ id: null, title: '', description: '' });

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/forms', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForms(response.data);
        } catch (error) {
            console.error('Error fetching forms:', error);
        }
    };

    const addForm = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/forms', { title, description }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForms([...forms, { id: response.data.id, title, description }]);
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('Error adding form:', error);
        }
    };

    const deleteForm = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/forms/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForms(forms.filter(form => form.id !== id));
        } catch (error) {
            console.error('Error deleting form:', error);
        }
    };

    const editForm = (form) => {
        setEditing(true);
        setCurrentForm({ id: form.id, title: form.title, description: form.description });
    };

    const updateForm = async () => {
        try {
            await axios.put(`http://localhost:5000/api/forms/${currentForm.id}`, 
                { title: currentForm.title, description: currentForm.description }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setForms(forms.map(form => (form.id === currentForm.id ? currentForm : form)));
            setEditing(false);
            setCurrentForm({ id: null, title: '', description: '' });
        } catch (error) {
            console.error('Error updating form:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl mb-4">{editing ? 'Edit Form' : 'Add Form'}</h2>
            <form
                onSubmit={e => {
                    e.preventDefault();
                    editing ? updateForm() : addForm();
                }}
                className="mb-4"
            >
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                    <input
                        type="text"
                        value={editing ? currentForm.title : title}
                        onChange={e =>
                            editing
                                ? setCurrentForm({ ...currentForm, title: e.target.value })
                                : setTitle(e.target.value)
                        }
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <input
                        type="text"
                        value={editing ? currentForm.description : description}
                        onChange={e =>
                            editing
                                ? setCurrentForm({ ...currentForm, description: e.target.value })
                                : setDescription(e.target.value)
                        }
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    {editing ? 'Update Form' : 'Add Form'}
                </button>
            </form>
            <ul className="list-disc pl-5">
                {forms.map(form => (
                    <li key={form.id} className="mb-4">
                        <h3 className="text-xl font-bold">{form.title}</h3>
                        <p>{form.description}</p>
                        <button
                            onClick={() => editForm(form)}
                            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline mr-2"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => deleteForm(form.id)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Forms;
