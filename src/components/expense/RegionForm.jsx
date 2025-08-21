import React, { useState } from 'react';
import { regionAPI, apiUtils } from '../../services/apiService';

const RegionForm = () => {
    const [regionName, setRegionName] = useState('');
    const [areas, setAreas] = useState([
        { name: '', centres: [{ name: '' }] }
    ]);

    const handleRegionChange = (e) => {
        setRegionName(e.target.value);
    };

    const handleAreaChange = (index, value) => {
        const updatedAreas = [...areas];
        updatedAreas[index].name = value;
        setAreas(updatedAreas);
    };

    const handleCentreChange = (areaIndex, centreIndex, value) => {
        const updatedAreas = [...areas];
        updatedAreas[areaIndex].centres[centreIndex].name = value;
        setAreas(updatedAreas);
    };

    const addArea = () => {
        setAreas([...areas, { name: '', centres: [{ name: '' }] }]);
    };

    const addCentre = (areaIndex) => {
        const updatedAreas = [...areas];
        updatedAreas[areaIndex].centres.push({ name: '' });
        setAreas(updatedAreas);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: regionName,
                areas,
            };
            const result = await regionAPI.createRegion(payload);
            alert('Region created successfully!');
            console.log(result);
        } catch (error) {
            const { message } = apiUtils.handleError(error);
            console.error('Submission Error:', message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-4">Add Region</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block font-semibold mb-1">Region Name</label>
                    <input
                        type="text"
                        value={regionName}
                        onChange={handleRegionChange}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Enter Region Name"
                        required
                    />
                </div>

                {areas.map((area, areaIndex) => (
                    <div key={areaIndex} className="border border-gray-200 p-4 rounded mt-4">
                        <label className="block font-semibold mb-1">Area Name</label>
                        <input
                            type="text"
                            value={area.name}
                            onChange={(e) => handleAreaChange(areaIndex, e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
                            placeholder="Enter Area Name"
                            required
                        />

                        <div className="space-y-2">
                            {area.centres.map((centre, centreIndex) => (
                                <input
                                    key={centreIndex}
                                    type="text"
                                    value={centre.name}
                                    onChange={(e) => handleCentreChange(areaIndex, centreIndex, e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    placeholder={`Centre ${centreIndex + 1}`}
                                    required
                                />
                            ))}
                            <button
                                type="button"
                                onClick={() => addCentre(areaIndex)}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                            >
                                + Add Centre
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addArea}
                    className="text-sm text-green-600 hover:underline"
                >
                    + Add Area
                </button>

                <div>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        Submit Region
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegionForm;
