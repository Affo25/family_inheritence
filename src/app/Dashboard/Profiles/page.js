"use client";
import React, { useState, useEffect } from "react";
import 'react-datepicker/dist/react-datepicker.css';
import ReactPaginate from "react-paginate";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import usePersonStore from '../../stores/profile_stores';
import useEducationStore from '../../stores/Education_store';
import useProfileStore from '../../stores/profile_stores';
import useDeathStore from '../../stores/death_store';
import useRelationshipStore from '../../stores/relationship_store';
import DatePicker from 'react-datepicker';
import Dropdown from 'react-bootstrap/Dropdown';
import DeleteModal from "../../componenet/deleteModal";
import SearchProfileModal from "../../componenet/SearchProfileModal";
import PersonDataTable from "../../componenet/dataTable";
import MarriageDeleteModal from "../../componenet/marriageDeleteModal";
import UserCard from "../../componenet/user_profile";
import DeathDataTable from "../../componenet/death_dataTable";
import EducationDataTable from "../../componenet/education_dataTable";
import EducationDeleteModal from "../../componenet/educationDeleteModal";

function Page() {
  const {
    persons,
    marriageRecords,
    pagination,
    loading,
    formData,
    formErrors,
    setFormData,
    validateForm,
    addCustomer,
    updateCustomer,
    fetchCustomers,
    deleteCustomer,
    getuserRecord
  } = usePersonStore();

  const {
    educations,
    loading: educationLoading,
    formData: educationFormData,
    formErrors: educationFormErrors,
    setFormData: setEducationFormData,
    validateForm: validateEducationForm,
    addCustomer: addEducation,
    updateCustomer: updateEducation,
    fetchCustomers: fetchEducations,
    deleteCustomer: deleteEducation
  } = useEducationStore();

  const {
    deaths,
    loading: deathLoading,
    formData: deathFormData,
    formErrors: deathFormErrors,
    setFormData: setdeathFormData,
    validateForm: validatedeathForm,
    addCustomer: adddeath,
    updateCustomer: updatedeath,
    fetchCustomers: fetchdeaths,
    deleteCustomer: deletedeath
  } = useDeathStore();

  const {
    relationship,
    loading: RelationshipLoading,
    formData: RelationshipFormData,
    formErrors: RelationshipFormErrors,
    setFormData: setRelationshipFormData,
    validateForm: validateRelationshipForm,
    addCustomer: addRelationship,
    updateCustomer: updateRelationship,
    fetchCustomers: fetchRelationship,
    deleteCustomer: deleteRelationship
  } = useRelationshipStore();

  const {
    profile: filteredProfile,
    loading: loadings,
    error,
    pagination: paginations,
    searchProfiles: searchProfiles,
    setPagination,
  } = useProfileStore();

  // Local state for search filters
  const [filters, setFilters] = useState({
    first_name: '',
    last_name: '',
    status: '',
    gender: '',
    page: 1,
  });

  // Define enums for dropdown options
  const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
  const MARRIAGE_STATUS = [
    "Married", "Divorced", "Widowed", "Separated", "Other"
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEducationDeleteModalOpen, setIsEducationDeleteModalOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPersonId, setCurrentPersonId] = useState(null);
  const [personToDelete, setPersonToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchProfileQuery, setSearchProfileQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [currentMarriagePage, setCurrentMarriagePage] = useState(0);
  const personsPerPage = 5;
  const marriagePerPage = 0;
  const [isDeleteMrrigeModalOpen, setIsDeleteMarriageModalOpen] = useState(false);

  const [mrriageToDelete, setMaarriageToDelete] = useState(null);
  const [filteredMarriages, setFilteredMarriages] = useState([]);
  const [searchMrrigeQuery, setSearchMarriageQuery] = useState("");
  const [filteredPersons, setFilteredPersons] = useState([]);
  const [activeTab, setActiveTab] = useState('person-details');
  const [selectedPersonId, setselectedPersonId] = useState(null);
  const [selectedPersonId1, setselectedPersonId1] = useState("");
  const [selectedPersonId2, setselectedPersonId2] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Manage menu state
  const [profiles, setProfiles] = useState(persons); // All records
  const [filteredProfiles, setFilteredProfiles] = useState([]); // Filtered result
  const [currentProfileKey, setCurrentProfileKey] = useState('');
  const [searchText, setSearchText] = useState("");
  const [person, setProfile] = useState(null); // Global in this component
  const [marriageList, setMarriageList] = useState([]); // For direct marriage records
  const person1Profile = [];
  const person2Profile = [];




  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Search input typing
  const handleInputChanges = (text) => {
    setSearchText(text);
  };


  // Search button click
  const fetchSingleRecord = (userId) => {
    getuserRecord(userId);

  };

  // Search button click
  const handleSearchChanges = (query) => {
    setSearchQuery(query);
    searchProfiles(query); // <- Make sure this function exists
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setFormErrors({ ...formErrors, profileImage: 'Only image files are allowed' });
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setFormErrors({ ...formErrors, profileImage: 'File size must be less than 2MB' });
        return;
      }

      setSelectedFile(file);
      setFormErrors({ ...formErrors, profileImage: '' });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    // Clear the file input
    document.getElementById('profileImage').value = '';
  };


  const searcProfileDetails = () => {
    searchProfiles();
  }

  // Handle search input change
  const handleSearchProfileChange = (e) => {
    const query = e.target.value;
    setSearchProfileQuery(query);

    // Debounce search
    const timer = setTimeout(() => {
      searchProfiles({
        q: query,
        page: 1, // Reset to first page on new search
      });
      setOffset(0);
    }, 500);

    return () => clearTimeout(timer);
  };

  // Toggle the dropdown visibility
  const removeFilterList = () => {
    console.log(isMenuOpen);
    setFilteredProfiles([]);
  };

  useEffect(() => {
    const query = searchProfileQuery.trim().toLowerCase();

    if (query.length > 0) {
      const updatedFilteredPersons = persons.filter((person) => {
        return (
          person.first_name?.toLowerCase().includes(query) ||
          person.last_name?.toLowerCase().includes(query) ||
          person.email?.toLowerCase().includes(query) ||
          person.contact?.toLowerCase().includes(query) ||
          person.cnic?.toLowerCase().includes(query)
        );
      });

      if (updatedFilteredPersons.length > 0) {
        setFilteredProfiles(updatedFilteredPersons);
      } else {
        setFilteredProfiles([]); // Empty match — optional: show "No result" message in UI
      }
    } else {
      setFilteredProfiles([]); // Empty search — optional: show "Enter search term" message
    }
  }, [searchProfileQuery, persons]);

  // Toggle the dropdown visibility
  const toggleMenu = () => {
    console.log(isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
  };

  const offset = currentPage * personsPerPage;
  const currentPersons = filteredPersons.slice(offset, offset + personsPerPage);

  const marriageOffset = currentMarriagePage * marriagePerPage;
  const currentMarriages = filteredMarriages.slice(marriageOffset, marriageOffset + marriagePerPage);

  const handlePageClick = (selected) => {
    setCurrentPage(selected.selected);
  };

  const handlesPageClick = (selected) => {
    setCurrentMarriagePage(selected.selected);
  };

  // select person method
 const handleSelectPerson = (key, data) => {
  console.log('handleSelectPerson called with key:', key, 'and data:', data);
  
  // Accept only valid keys
  if (key !== 'father_id' && key !== 'mother_id') {
    console.error('Invalid key:', key);
    return;
  }

  // Validate data and ensure pid exists
  if (!data || !data.pid) {
    console.error('Invalid person data:', data);
    return;
  }

  const personId = data.pid;
  console.log(`Setting ${key} to MongoDB _id:`, personId);

  // Update both the individual state and formData in one go
  if (key === "father_id") {
    setselectedPersonId1(personId);
  } else if (key === "mother_id") {
    setselectedPersonId2(personId);
  }

  // ✅ This will work for your current store
setFormData({ [key]: personId });


  console.log('formData (post-update):', formData);

  closeSearchModal();
};







  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };




  const handleDelete = async (personId) => {
    try {
      const success = await deleteCustomer(personId);
      if (success) {
        setCloseDeleteModal();
        console.log('Person deleted successfully');
      } else {
        console.error('Failed to delete person');
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
    }
  };



  useEffect(() => {
    fetchCustomers({ page: pagination.page });
    fetchEducations();
    fetchdeaths();
    fetchRelationship();
    console.log("relationship data:", relationship);
  }, []);

  // Monitor changes to marriageRecords
  useEffect(() => {
    console.log("Marriage records updated in component:", marriageRecords);
  }, [marriageRecords]);

  // Monitor changes to marriageList
  useEffect(() => {
    console.log("Marriage list updated in component:", marriageList);
  }, [marriageList]);

  const handlePageChange = (newPage) => {
    fetchCustomers({ page: newPage });
  };

 

  // Fetch education records when currentPersonId changes
  useEffect(() => {
    if (currentPersonId) {
      fetchEducations();
    }
    const fullName = personMap.get(formData.mother_id);
  }, [currentPersonId]);

  const openSerchModal = (key) => {
    console.log("Opening search modal for key:", key);
    setCurrentProfileKey(key);
    setIsSearchModalOpen(true);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const openMngeModal = async (person) => {
    console.log("Selected profile:", person.pid);
    try {
      toast.info("Fetching marriage data...");

      const fetchMarriageData = async (userId) => {
        try {
          const response = await fetch(`/api/MarriageData?id=${userId}`);
          const data = await response.json();

          if (data.success && data.record) {
            const records = Array.isArray(data.record) ? data.record : [data.record];

            console.log("Marriage records fetched:", records);

            usePersonStore.setState({
              marriageRecords: records,
              loading: false,
              error: null
            });

            setMarriageList(records);
            return records;
          } else {
            console.error("Failed to fetch marriage records:", data.message || "Unknown error");
            setMarriageList([]);
            return [];
          }
        } catch (error) {
          console.error("Error fetching marriage records:", error);
          setMarriageList([]);
          return [];
        }
      };

      const marriageData = await fetchMarriageData(person.pid);
      console.log("Marriage Records fetched:", marriageData);

      setProfile(person);
      setIsModalOpen(true);

      toast.success("Marriage data loaded successfully");
    } catch (error) {
      console.error("Error fetching marriage data:", error);
      toast.error("Failed to fetch marriage data");

      setProfile(person);
      setIsModalOpen(true);
    }
  };


  const closeSerchModal = () => {
    setIsSearchModalOpen(false);
  };

  const closeModals = () => {
    setMarriageList([]);
    usePersonStore.setState({ marriageRecords: [], loading: false, error: null });
    setIsModalOpen(false);
  };

  const openDeleteModal = (person) => {
    setPersonToDelete(person);
    setIsDeleteModalOpen(true);
  };

  const opensDeleteModal = (person) => {
    setMaarriageToDelete(person);
    setIsDeleteMarriageModalOpen(true);
  };

  const setClosesDeleteModal = () => {
    setIsDeleteMarriageModalOpen(false);
    setMaarriageToDelete(null);
  };

  const setCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPersonToDelete(null);
  };

  const setEducationCloseDeleteModal = () => {
    setIsEducationDeleteModalOpen(false);
    setPersonToDelete(null);
  };

  const openEducationDeleteModal = (person) => {
    setPersonToDelete(person);
    setIsEducationDeleteModalOpen(true);
  };


  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const updatedFilteredPersons = persons.filter((person) => {
      return (
        (person.first_name?.toLowerCase().includes(query) ?? false) ||
        (person.last_name?.toLowerCase().includes(query) ?? false) ||
        (person.email?.toLowerCase().includes(query) ?? false) ||
        (person.contact?.includes(query) ?? false) ||
        (person.cnic?.includes(query) ?? false)
      );
    });
    setFilteredPersons(updatedFilteredPersons);
  }, [searchQuery, persons]);

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentPersonId(null);
    // Reset preview image and selected file
    setPreviewImage(null);
    setSelectedFile(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      gender:'',
      contact: '',
      birth_date: null,
      birth_place: '',
      blood_group: '',
      marital_status: '',
      occupation: '',
      alive: false,
      cnic: '',
      gr_father_id: '',
      gr_mother_id: '',
      mother_id: '',
      father_id: '',
    });
    usePersonStore.setState({ formErrors: {} });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleReltionshipInputChange = (e) => {
    const { name, value } = e.target;
    setRelationshipFormData({
      [name]: value,
    });
  };




  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ [name]: checked });
  };

  const handleDateChange = (date) => {
    setFormData({ birth_date: date });
  };

  const handleEdit = (person) => {
    setFormData({
      first_name: person.first_name || '',
      last_name: person.last_name || '',
      email: person.email || '',
      gender: person.gender || '',
      image: person.image || '',
      contact: person.contact || '',
      birth_date: person.birth_date ? new Date(person.birth_date) : null,
      birth_place: person.birth_place || '',
      blood_group: person.blood_group || '',
      marital_status: person.marital_status || '',
      occupation: person.occupation || '',
      alive: person.alive !== undefined ? person.alive : false,
      cnic: person.cnic || '',
      gr_father_id: person.gr_father_id || '',
      gr_mother_id: person.gr_mother_id || '',
      mother_id: person.mother_id || '',
      father_id: person.father_id || '',
    });
    
    // Set the preview image if the person has an image
    if (person.image) {
      setPreviewImage(person.image);
    } else {
      setPreviewImage(null);
    }

    // Set the prodile_id in the education form data and clear any previous errors
    setEducationFormData({
      ...useEducationStore.getState().formData,
      prodile_id: person._id
    });

    // Clear any prodile_id validation errors
    useEducationStore.setState({
      formErrors: {
        ...useEducationStore.getState().formErrors,
        prodile_id: ''
      }
    });

    setIsEditMode(true);
    setCurrentPersonId(person._id);
    setIsModalOpen(true);
  };

  const closeSearchModal = () => {
    console.log("Closing search modal");
    setIsSearchModalOpen(false);
    setSearchProfileQuery('');
    // Don't reset currentProfileKey here as it needs to be preserved
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    try {
      let success = false;
      if (isEditMode && currentPersonId) {
        // Pass the complete formData to ensure all fields are sent to the API
        success = await updateCustomer(currentPersonId, formData);
      } else {
        success = await addCustomer(formData);
      }

      if (success) {
        closeModal();
        fetchCustomers();
        toast.success(isEditMode ? 'Profile updated successfully!' : 'Profile created successfully!');
      } else {
        console.error("Operation failed");
        toast.error("Operation failed. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An error occurred. Please try again.");
    }
  };





  const exportJsonToExcel = async (fileName = 'persons_data.xlsx') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Persons');
    const dataArray = Array.isArray(persons) ? persons : [persons];
    if (dataArray.length === 0) return;

    // Define specific headers we want to export
    const headerMap = {
      first_name: 'First Name',
      last_name: 'Last Name',
      email: 'Email',
      contact: 'Contact',
      birth_date: 'Birth Date',
      birth_place: 'Birth Place',
      blood_group: 'Blood Group',
      marital_status: 'Marital Status',
      occupation: 'Occupation',
      alive: 'Alive',
      cnic: 'CNIC'
    };

    worksheet.columns = Object.entries(headerMap).map(([key, header]) => ({
      header,
      key,
      width: 20,
    }));

    // Format the data for Excel
    const formattedData = dataArray.map(person => {
      const row = { ...person };
      if (row.birth_date) {
        row.birth_date = new Date(row.birth_date).toLocaleDateString();
      }
      row.alive = row.alive ? 'Yes' : 'No';
      return row;
    });

    formattedData.forEach(row => worksheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, fileName);
  };

const personMap = new Map(
  persons.map(p => [p.pid, `${p.first_name} ${p.last_name}`])
);


  return (

    <div className="nk-content-body">
      <div className="nk-block-head nk-block-head-sm p-0">
        {isModalOpen === false ? (
          <div className="nk-block-between">
            <div className="nk-block-head-content">
              <h3 className="nk-block-title page-title">Persons Details Management</h3>
              <div className="nk-block-des text-soft">
                <p>Manage and keep track of all persons in the system</p>
              </div>
            </div>
            <div className="nk-block-head-content">
              <ul className="nk-block-tools gx-3">
                <li>
                  <button className="btn btn-success ml-1">
                    <span>Upload From Excel</span>
                  </button>
                  <button onClick={exportJsonToExcel} className="btn btn-danger ml-1">
                    <span>Download Excel</span>
                  </button>
                  <button type="button" className="btn btn-primary ml-1" onClick={openModal}>
                    <span>Add New Person</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="nk-block-between">
            <div className="nk-block-head-content">
              <h3 className="nk-block-title page-title">Create Persons Detail</h3>
              <div className="nk-block-des text-soft">
                <p>Manage and keep track of all persons in the system</p>
              </div>
            </div>
            <div className="nk-block-head-content">
              <ul className="nk-block-tools gx-3">
                <li>
                  <button type="button" className="btn btn-danger ml-1" onClick={closeModals}>
                    <span>Cancel</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}

          <div style={{ marginTop: "10px" }} class="row">

            <div class="col-md-12">
              <ul className="nav nav-tabs bg-dark rounded-top rounded-bottom">
                <li style={{ marginLeft: "10px" }} className="nav-item">
                  <a
                    className={`nav-link text-white ${activeTab === 'person-details' ? 'active' : ''}`}
                    data-bs-toggle="tab"
                    href="#person-details-tab"
                    onClick={() => setActiveTab('person-details')}
                  >
                    PENDING
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link text-white ${activeTab === 'education-detail' ? 'active' : ''}`}
                    data-bs-toggle="tab"
                    href="#education-detail-tab"
                    onClick={() => setActiveTab('education-detail')}
                  >
                    APPROVED
                  </a>
                </li>
              </ul>
              <div style={{ marginTop: "-0.75rem" }} class="tab-content">
                {activeTab === 'person-details' && (
                  <div id="person-details-tab" className="tab-pane fade show active">

                    <PersonDataTable
                      openModal={openMngeModal}
                      handlePageChange={handlePageChange}
                      pagination={pagination}
                      status="Pending"
                      currentPersons={currentPersons}
                      persons={persons}
                      loading={loading}
                      searchQuery={searchQuery}
                      offset={offset}
                      personsPerPage={personsPerPage}
                      filteredPersons={filteredPersons}
                      handleSearchChange={handleSearchChange}
                      handlePageClick={handlePageClick}
                      openDeleteModal={openDeleteModal}
                      handleEdit={handleEdit}
                    />

                  </div>
                )}
                {activeTab === 'education-detail' && (
                  <div id="education-detail-tab" className="tab-pane fade show active">
                    <PersonDataTable
                      openModal={openMngeModal}
                      handlePageChange={handlePageChange}
                      pagination={pagination}
                      status="Approved"
                      currentPersons={currentPersons}
                      persons={persons}
                      loading={loading}
                      searchQuery={searchQuery}
                      offset={offset}
                      personsPerPage={personsPerPage}
                      filteredPersons={filteredPersons}
                      handleSearchChange={handleSearchChange}
                      handlePageClick={handlePageClick}
                      openDeleteModal={openDeleteModal}
                      handleEdit={handleEdit}
                    />
                  </div>
                )}




              </div>
            </div>
          </div>

         
        


        {/* Add Customer Modal */}
        {isModalOpen && (
          <div className="modal fade zoom show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl" role="document">
              <div className="modal-content">
                <div className="modal-header bg-primary">
                  <h5 className="modal-title text-white">
                    <span>{isEditMode ? 'Edit Person Detail' : 'Add Person Detail'}</span>
                  </h5>
                  <button style={{ color: "#fff" }} className="close" onClick={closeModal} aria-label="Close">
                    <em className="icon ni ni-cross-sm"></em>
                  </button>
                </div>
                 <div class="card card-bordered card-preview">

                      <div class="card-inner-group">
                        <div class="card-inner p-0">
                          <form onSubmit={handleSubmit}>
                            <div className="modal-body pt-3">
                              {usePersonStore.getState().error && (
                                <div className="alert alert-danger">
                                  {usePersonStore.getState().error}
                                </div>
                              )}

                              <div className="row">
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>First Name</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="first_name"
                                        className={`form-control form-control-lg ${formErrors.first_name ? 'is-invalid' : ''}`}
                                        placeholder="Enter first name"
                                        value={formData.first_name || ""}
                                        onChange={handleInputChange}
                                      />
                                      {formErrors.first_name && (
                                        <div className="invalid-feedback">{formErrors.first_name}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Last Name</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="last_name"
                                        className={`form-control form-control-lg ${formErrors.last_name ? 'is-invalid' : ''}`}
                                        placeholder="Enter last name"
                                        value={formData.last_name || ""}
                                        onChange={handleInputChange}
                                      />
                                      {formErrors.last_name && (
                                        <div className="invalid-feedback">{formErrors.last_name}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label">
                                      <span>Profile Image</span>
                                    </label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="file"
                                        id="profileImage"
                                        accept="image/*"
                                        className="d-none"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                              setPreviewImage(reader.result);
                                            };
                                            reader.readAsDataURL(file);

                                            setSelectedFile(file); // local state for preview
                                            setFormData({ image: file }); // update zustand store formData
                                          }
                                        }}
                                      />
                                      <div className="d-flex align-items-center">
                                        {previewImage ? (
                                          <div className="position-relative me-3">
                                            <img
                                              src={previewImage}
                                              alt="Preview"
                                              className="rounded-circle"
                                              style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                                border: '2px solid #eee',
                                              }}
                                            />
                                            <button
                                              type="button"
                                              className="btn btn-icon btn-sm btn-danger position-absolute top-0 end-0"
                                              onClick={() => {
                                                setPreviewImage(null);
                                                setSelectedFile(null);
                                                setFormData({ image: '' }); // clear image from store
                                              }}
                                              style={{ transform: 'translate(30%, -30%)' }}
                                            >
                                              <i className="fas fa-times"></i>
                                            </button>
                                          </div>
                                        ) : (
                                          <div
                                            className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
                                            style={{
                                              width: '80px',
                                              height: '80px',
                                              cursor: 'pointer',
                                            }}
                                            onClick={() => document.getElementById('profileImage').click()}
                                          >
                                            <i className="fas fa-camera text-muted"></i>
                                          </div>
                                        )}
                                        <div>
                                          <button
                                            type="button"
                                            className="btn btn-outline-light btn-sm"
                                            onClick={() => document.getElementById('profileImage').click()}
                                          >
                                            {previewImage ? 'Change Image' : 'Upload Image'}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Email</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="email"
                                        name="email"
                                        className={`form-control form-control-lg ${formErrors.email ? 'is-invalid' : ''}`}
                                        placeholder="Enter email"
                                        value={formData.email || ""}
                                        onChange={handleInputChange}
                                      />
                                      {formErrors.email && (
                                        <div className="invalid-feedback">{formErrors.email}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Contact</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="contact"
                                        className={`form-control form-control-lg ${formErrors.contact ? 'is-invalid' : ''}`}
                                        placeholder="Enter contact number"
                                        value={formData.contact || ""}
                                        onChange={handleInputChange}
                                      />
                                      {formErrors.contact && (
                                        <div className="invalid-feedback">{formErrors.contact}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>CNIC</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="cnic"
                                        className={`form-control form-control-lg ${formErrors.cnic ? 'is-invalid' : ''}`}
                                        placeholder="Enter CNIC (XXXXX-XXXXXXX-X)"
                                        value={formData.cnic || ""}
                                        onChange={handleInputChange}
                                      />
                                      {formErrors.cnic && (
                                        <div className="invalid-feedback">{formErrors.cnic}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Birth Date</span></label>
                                    <div className="form-control-wrap">
                                      <DatePicker
                                        selected={formData.birth_date}
                                        onChange={handleDateChange}
                                        className="form-control form-control-lg"
                                        placeholderText="Select birth date"
                                        dateFormat="yyyy-MM-dd"
                                        maxDate={new Date()}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Birth Place</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="birth_place"
                                        className="form-control form-control-lg"
                                        placeholder="Enter birth place"
                                        value={formData.birth_place || ""}
                                        onChange={handleInputChange}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Blood Group</span></label>
                                    <div className="form-control-wrap">
                                      <select
                                        name="blood_group"
                                        className="form-control form-control-lg"
                                        value={formData.blood_group || "Unknown"}
                                        onChange={handleInputChange}
                                      >
                                        {BLOOD_GROUPS.map(group => (
                                          <option key={group} value={group}>{group}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Marital Status</span></label>
                                    <div className="form-control-wrap">
                                      <select
                                        name="marital_status"
                                        className="form-control form-control-lg"
                                        value={formData.marital_status || "Single"}
                                        onChange={handleInputChange}
                                      >
                                        {MARITAL_STATUS.map(status => (
                                          <option key={status} value={status}>{status}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Occupation</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="occupation"
                                        className="form-control form-control-lg"
                                        placeholder="Enter occupation"
                                        value={formData.occupation || ""}
                                        onChange={handleInputChange}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <div className="custom-control custom-switch">
                                      <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="alive"
                                        name="alive"
                                        checked={formData.alive}
                                        onChange={handleCheckboxChange}
                                      />
                                      <label className="custom-control-label" htmlFor="alive">Alive</label>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Gender</span></label>
                                    <div className="form-control-wrap">
                                      <select
                                        name="gender"
                                        className="form-control form-control-lg"
                                        value={formData.gender || ""}
                                        onChange={handleInputChange}
                                      >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                 <div className="col-md-4">
                                            <div className="form-group mt-1">
                                              <label className="form-label">Select Father</label>
                                              <div className="form-control-wrap">
                                                <div className="d-flex justify-content-between align-items-center">
                                                  <div className="form-control form-control-lg">
                                                    {formData.father_id
                                                      ? persons.find(p => p.pid === formData.father_id)
                                                        ? `${persons.find(p => p.pid === formData.father_id).first_name} ${persons.find(p => p.pid === formData.father_id).last_name}`
                                                        : formData.father_id
                                                      : selectedPersonId1.slice(0, 12)}
                                                  </div>
                                                  <button className="btn btn-primary ml-2" type="button" onClick={() => openSerchModal('father_id')}>
                                                    Choose
                                                  </button>
                                                </div>
                                                {formErrors.father_id && (
                                                  <div className="invalid-feedback">{formErrors.father_id}</div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="col-md-4">
                                            <div className="form-group mt-1">
                                              <label className="form-label">Select Mother</label>
                                              <div className="form-control-wrap">
                                                <div className="d-flex justify-content-between align-items-center">
                                                  <div className="form-control form-control-lg">
                                      {formData.mother_id
                                                      ? persons.find(p => p.pid === formData.mother_id)
                                                        ? `${persons.find(p => p.pid === formData.mother_id).first_name} ${persons.find(p => p.pid === formData.mother_id).last_name}`
                                                        : formData.mother_id
                                                      : selectedPersonId2.slice(0, 12)}
                                                  </div>
                                                  <button className="btn btn-primary ml-2" type="button" onClick={() => openSerchModal('mother_id')}>
                                                    Choose
                                                  </button>
                                                </div>
                                                {formErrors.mother_id && (
                                                  <div className="invalid-feedback">{formErrors.mother_id}</div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                               
                              </div>
                              <div className="row mt-2" style={{ borderTop: "1px solid #ede8e8" }}>
                                <div className="col-md-9"></div>
                                <div className="col-md-3 text-right pt-2">
                                  <button type="submit" className="btn btn-primary w-100 justify-center" disabled={loading}>
                                    {loading ? (
                                      <div className="d-flex justify-content-center">
                                        <div className="spinner-border" role="status">
                                          <span className="sr-only">Loading...</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <span>{isEditMode ? 'Update' : 'Save'}</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>

                      </div>
                    </div>
              </div>
            </div>
          </div>
        )}

       

        {isDeleteModalOpen && (
          <DeleteModal
            personToDelete={personToDelete}
            loading={loading}
            setCloseDeleteModal={setCloseDeleteModal}
            handleDelete={handleDelete}
          />
        )}

       

        {isSearchModalOpen && (
          <SearchProfileModal
            currentPersons={filteredProfiles}
            loading={loadings}
            isEditMode={isEditMode}
            searchQuery={handleInputChanges}
            handleSearchChange={handleSearchChanges}
            handlePageClick={handlePageClick}
            offset={offset}
            close={closeSearchModal}
            handleSelectPerson={(person) => handleSelectPerson(currentProfileKey, person)}
            clearList={removeFilterList}
          />
        )}
      </div>
    </div>
  );
}

export default Page;
