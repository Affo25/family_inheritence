import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import usePersonStore from '../stores/profile_stores';
import GlobalLoader from '../componenet/globalLoader';

function SearchUserProfileModal({
    closeModal=(event)=>{},
     onSend=(event)=>{},
    handleSelectPerson,
    status = '' // Optional status filter
}) {
    const [filters, setFilters] = useState({
        first_name: '',
        last_name: '',
        email: '',
        contact: '',
        cnic: '',
    });

    const [maritalStatus, setMaritalStatus] = useState('');
    const [gender, setGender] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [isAlive, setIsAlive] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [DidSearch, setDidSearch] = useState(false);
    // Get Zustand store methods and state
    const {
        searchProfiles:fetchRecord,
        filteredPersons,
        loading,
        pagination,
        isSearchMode,
        setPagination,
        clearSearch,
        error
    } = usePersonStore();

    // Handle search button click
    const handleSearch = async () => {
        const searchData = {};
        
        // Add text search fields if they have values
        Object.entries(filters).forEach(([key, value]) => {
            if (value.trim()) {
                searchData[key] = value.trim();
            }
        });
        
        // Add dropdown selections if they have values
        if (maritalStatus) searchData.marital_status = maritalStatus;
        if (gender) searchData.gender = gender;
        if (birthPlace) searchData.birth_place = birthPlace;
        if (isAlive !== null) searchData.alive = isAlive;
        if (status) searchData.status = status;

        try {
             await fetchRecord(searchData);
                   setShowResults(true);
                   setDidSearch(true);
                   
        } catch (error) {
            console.error('Search failed:', error);
            toast.error('Search failed: ' + (error.message || 'Unknown error'));
        }
    };

    useEffect(() => {
    if (DidSearch && filteredPersons.length >= 0) {
        setShowResults(true);
        onSend(filteredPersons);
        closeModal();
        setDidSearch(false); // Reset
    }
}, [filteredPersons,DidSearch]);

    // Handle page change in pagination
    const handlePageChange = (newPage) => {
        setPagination({ ...pagination, page: newPage });
        fetchRecord({ 
            ...buildSearchCriteria(),
            page: newPage 
        });
    };

    // Build search criteria from current filters
    const buildSearchCriteria = () => {
        const searchData = {};
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value.trim()) {
                searchData[key] = value.trim();
            }
        });
        
        if (maritalStatus) searchData.marital_status = maritalStatus;
        if (gender) searchData.gender = gender;
        if (birthPlace) searchData.birth_place = birthPlace;
        if (isAlive !== null) searchData.alive = isAlive;
        if (status) searchData.status = status;
        
        return searchData;
    };

    // Handle selecting a person from results
    const selectPerson = (person) => {
        if (handleSelectPerson) {
            handleSelectPerson(person);
            closeModal();
        }
    };

    // Reset filters and clear search
    const resetFilters = () => {
        setFilters({
            first_name: '',
            last_name: '',
            email: '',
            contact: '',
            cnic: '',
        });
        setMaritalStatus('');
        setGender('');
        setBirthPlace('');
        setIsAlive(null);
        setShowResults(false);
        clearSearch();
    };

    // Apply filters and close modal
    const applyFilters = () => {
        if (filteredPersons.length > 0) {
            closeModal(filteredPersons);
        } else {
            toast.info("No search results to apply");
            closeModal();
        }
    };
    
    // Close modal handler
    const handleClose = () => {
        closeModal();
    };

    return (
        <>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                <div className="modal-dialog modal-xl" role="document">
                    <div style={{ position: 'fixed', width: '70%' }} className="modal-content">
                        <div style={{backgroundColor:"#219ebc"}} className="modal-header">
                            <h5 className="modal-title text-white">Filter User Data</h5>
                            <div>
                                {showResults && filteredPersons.length > 0 && (
                                    <button
                                        style={{ color: '#fff', marginRight: '10px' }}
                                        type="button"
                                        className="btn btn-success btn-sm"
                                        onClick={applyFilters}
                                    >
                                        Apply Filters
                                    </button>
                                )}
                                <button
                                    style={{ color: '#fff' }}
                                    type="button"
                                    className="close"
                                    onClick={handleClose}
                                    
                                >
                                    <em className="icon ni ni-cross-sm"></em>
                                </button>
                            </div>
                        </div>

                        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            {/* Filter Inputs */}
                            <div className="mb-3">
                                <div className="row">
                                    {['first_name', 'last_name', 'email', 'contact', 'cnic'].map(field => (
                                        <div className="col-md-2" key={field}>
                                            <label htmlFor={field} className="form-label">
                                                {field.replace('_', ' ').toUpperCase()}
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id={field}
                                                value={filters[field]}
                                                onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}
                                                placeholder={`Enter ${field.replace('_', ' ')}`}
                                            />
                                        </div>
                                    ))}
                                    <div className="col-md-2 d-flex align-items-center mt-4">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="isAlive"
                                            checked={isAlive === true}
                                            onChange={() => setIsAlive(prev => prev === null ? true : prev === true ? false : null)}
                                        />
                                        <label htmlFor="isAlive" className="form-check-label ml-2">
                                            Is Alive<br /><small style={{ fontSize: 10 }}>(Click 3 times)</small>
                                        </label>
                                    </div>
                                </div>

                                <div className="row mt-3 align-items-end">
                                    <div className="col-md-3">
                                        <label>Marital Status</label>
                                        <select className="form-control" value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
                                            <option value="">All</option>
                                            {['Single', 'Married', 'Divorced', 'Widowed', 'Separated', 'Other'].map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-3">
                                        <label>Gender</label>
                                        <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)}>
                                            <option value="">All</option>
                                            {['Male', 'Female', 'Other'].map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-3">
                                        <label>Birthplace</label>
                                        <select className="form-control" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)}>
                                            <option value="">All</option>
                                            {['Multan', 'Lahore', 'Karachi', 'Islamabad', 'Other'].map(place => (
                                                <option key={place} value={place}>{place}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="d-flex">
                                            <button 
                                                type="button" 
                                                className="btn btn-primary btn-md mr-2" 
                                                onClick={handleSearch}
                                                disabled={loading}
                                            >
                                                {loading ? 'Searching...' : 'SEARCH'}
                                            </button>
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary btn-md" 
                                                onClick={resetFilters}
                                                disabled={loading}
                                            >
                                                RESET
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search Results */}
                            {(showResults || isSearchMode) && (
                                <div className="mt-4">
                                    <h5 className="mb-3">Search Results ({pagination.total || 0})</h5>
                                    
                                    {error && (
                                        <div className="alert alert-danger">
                                            Error: {error}
                                        </div>
                                    )}
                                    
                                    {filteredPersons.length === 0 && !loading && !error ? (
                                        <div className="alert alert-info">
                                            No profiles found matching your search criteria.
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-bordered table-hover">
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Name</th>
                                                        <th>Gender</th>
                                                        <th>Contact</th>
                                                        <th>Email</th>
                                                        <th>Status</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredPersons.map((person, index) => (
                                                        <tr key={person._id || index}>
                                                            <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                                                            <td>
                                                                {person.first_name} {person.last_name}
                                                                {person.cnic && <div><small className="text-muted">CNIC: {person.cnic}</small></div>}
                                                            </td>
                                                            <td>{person.gender || 'N/A'}</td>
                                                            <td>{person.contact || 'N/A'}</td>
                                                            <td>{person.email || 'N/A'}</td>
                                                            <td>
                                                                <span className={`badge badge-${person.alive ? 'success' : 'danger'}`}>
                                                                    {person.alive ? 'Alive' : 'Deceased'}
                                                                </span>
                                                                {person.status && (
                                                                    <span className={`badge badge-${person.status === 'Approved' ? 'success' : 'warning'} ml-1`}>
                                                                        {person.status}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <button 
                                                                    className="btn btn-sm btn-primary"
                                                                    onClick={() => selectPerson(person)}
                                                                    disabled={loading}
                                                                >
                                                                    Select
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Loader */}
            <GlobalLoader visible={loading} />
        </>
    );
}

export default SearchUserProfileModal;