"use client";
import React, { useState, useEffect } from "react";
import 'react-datepicker/dist/react-datepicker.css';
import ReactPaginate from "react-paginate";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import usePersonStore from '../../stores/profile_stores';
import useEducationStore from '../../stores/Education_store';
import useDeathStore from '../../stores/death_store';
import useRelationshipStore from '../../stores/relationship_store';
import DatePicker from 'react-datepicker';
import Dropdown from 'react-bootstrap/Dropdown';
import DeleteModal from "../../componenet/deleteModal";
import SearchProfileModal from "@/app/componenet/SearchProfileModal";
import PersonDataTable from "@/app/componenet/dataTable";
import MarriageDataTable from "@/app/componenet/MarriageDataTable"
import MarriageDeleteModal from "@/app/componenet/marriageDeleteModal";

function Page() {
  const {
    persons,
    loading,
    formData,
    formErrors,
    setFormData,
    validateForm,
    addCustomer,
    updateCustomer,
    fetchCustomers,
    deleteCustomer
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

  // Define enums for dropdown options
  const MARITAL_STATUS = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated'];
  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
  const MARRIAGE_STATUS = [
    "Married", "Divorced", "Widowed", "Separated", "Other"
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

 

  const handleSearchProfileChange = (e) => {
    const query = e.target.value;
    console.log(query);
    setSearchProfileQuery(query);

    const filtered = profiles.filter(profile => {
      return (
        (profile.first_name?.includes(query) ?? false) ||
        (profile.last_name?.includes(query) ?? false) ||
        (profile.email?.includes(query) ?? false) ||
        (profile.contact?.includes(query) ?? false) ||
        (profile.cnic?.includes(query) ?? false)
      );
    });

    setFilteredProfiles(filtered);
    console.log("filterList:", filtered);
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

  const offsset = currentMarriagePage * marriagePerPage;
  const currentMarriages = filteredMarriages.slice(offsset, offsset + marriagePerPage);

  const handlePageClick = (selected) => {
    setCurrentPage(selected.selected);
  };

  const handlesPageClick = (selected) => {
    setCurrentMarriagePage(selected.selected);
  };


const handleSelectPerson = (key, data) => {
  // Ensure we only accept 'person1_id' or 'person2_id' as valid keys
  if (key !== 'person1_id' && key !== 'person2_id') {
    console.error('Invalid key:', key);
    return;
  }

  // Convert pid to string and trim whitespace
  const stringPid = String(data.pid).trim();

  // Validate we actually got an ID
  if (!stringPid) {
    console.error('No valid ID provided');
    return;
  }

  // Update individual person states if needed
  if (key === "person1_id") {
    setselectedPersonId1(stringPid);
  } else {
    setselectedPersonId2(stringPid);
  }

  // Update the form data while preserving other fields
  setRelationshipFormData(prev => ({
    ...prev,  // Keep existing values
    [key]: stringPid  // Update the specific person ID
  }));

  // Reset search and close modal
  filteredProfiles.clearList?.();
    closeSerchModal();

};

    

 const handleReltionshipSubmit = async (e) => {
  e.preventDefault();

  // Combine form data with selected IDs (if they exist separately)
  const finalFormData = {
    ...RelationshipFormData,
    person1_id: selectedPersonId1 ?? RelationshipFormData.person1_id,
    person2_id: selectedPersonId2 ?? RelationshipFormData.person2_id,
  };
console.log("construct object",finalFormData);
  // Validate required fields
  if (!finalFormData.person1_id) {
    useRelationshipStore.setState({
      formErrors: {
        ...useRelationshipStore.getState().formErrors,
        person1_id: "Please select person 1 first"
      }
    });
    toast.error("Please select person 1 first");
    return;
  }

  if (!finalFormData.person2_id) {
    useRelationshipStore.setState({
      formErrors: {
        ...useRelationshipStore.getState().formErrors,
        person2_id: "Please select person 2 first"
      }
    });
    toast.error("Please select person 2 first");
    return;
  }

  // Additional validation
  if (finalFormData.person1_id === finalFormData.person2_id) {
    toast.error("Cannot create relationship with the same person");
    return;
  }

  // Validate the form before proceeding
  const isValid = validateRelationshipForm();
  if (!isValid) return;

  try {
    // Prepare API call based on mode
    const apiCall = isEditMode && finalFormData._id 
      ? () => updateRelationship(finalFormData._id, finalFormData)
      : () => addRelationship(finalFormData);

    const success = await apiCall();

    if (success) {
      toast.success(`Relationship ${isEditMode ? 'updated' : 'created'} successfully`);
      
      // Reset form while preserving person selections
      setRelationshipFormData({
        person1_id: finalFormData.person1_id,
        person2_id: finalFormData.person2_id,
        relationship_type: '',
        status: '',
      });
      
      fetchRelationship();
      closeModal(); // If you have a modal to close
    } else {
      throw new Error('Operation failed');
    }
  } catch (error) {
    console.error("Error in handleReltionshipSubmit:", error);
    toast.error(error.message || "Error submitting relationship record");
  }
};

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMarriageSearchChange = (e) => {
    setSearchMarriageQuery(e.target.value);
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

  const handlesDelete = async (personId) => {
    try {
      const success = await deleteRelationship(personId);
      if (success) {
        setClosesDeleteModal();
        console.log('Record deleted successfully');
      } else {
        console.error('Failed to delete Record');
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchEducations();
    fetchdeaths();
    fetchRelationship();
    console.log("relationship data:", relationship);
  }, []);

  // Handle death date change
  const handleDeathDateChange = (date) => {
    setdeathFormData({
      ...deathFormData,
      death_date: date // Ensure this is a Date object
    });
  };

  // Fetch education records when currentPersonId changes
  useEffect(() => {
    if (currentPersonId) {
      fetchEducations();
    }
  }, [currentPersonId]);

  const openSerchModal = (key) => {
    setCurrentProfileKey(key);
    setIsSearchModalOpen(true);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeSerchModal = () => {
    setIsSearchModalOpen(false);
  };

  const closeModals = () => {
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
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
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


  const handleEducationInputChange = (e) => {
    const { name, value } = e.target;
    setEducationFormData({ [name]: value });
  };

  const handleDeathInputChange = (e) => {
    const { name, value } = e.target;
    setdeathFormData({ [name]: value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    try {
      let success = false;
      if (isEditMode && currentPersonId) {
        success = await updateCustomer(currentPersonId, formData);
      } else {
        success = await addCustomer(formData);
      }

      if (success) {
        closeModal();
        fetchCustomers();
      } else {
        console.error("Operation failed");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleEducationSubmit = async (e) => {
    e.preventDefault();

    // First, check if we have a prodile_id
    if (!educationFormData.prodile_id && !currentPersonId) {
      // Show error using the form errors
      useEducationStore.setState({
        formErrors: {
          ...useEducationStore.getState().formErrors,
          prodile_id: "Please select a person first"
        }
      });
      toast.error("Please select a person first");
      return;
    }

    // If we don't have prodile_id but have currentPersonId, set it
    if (!educationFormData.prodile_id && currentPersonId) {
      // Update the form data with the current person ID
      const updatedFormData = {
        ...educationFormData,
        prodile_id: currentPersonId
      };

      // Use the updated form data directly instead of waiting for state update
      const isValid = validateEducationForm();
      if (!isValid) return;

      try {
        let success = false;
        if (isEditMode && updatedFormData._id) {
          success = await updateEducation(updatedFormData._id, updatedFormData);
        } else {
          success = await addEducation(updatedFormData);
        }

        if (success) {
          // Reset education form but keep the prodile_id
          setEducationFormData({
            class_name: '',
            year: '',
            institute: '',
            prodile_id: currentPersonId
          });
          fetchEducations();
        } else {
          toast.error("Education operation failed");
        }
      } catch (error) {
        console.error("Error in handleEducationSubmit:", error);
        toast.error("Error adding education record");
      }
      return;
    }

    // Normal flow when we already have profile_id
    const isValid = validateEducationForm();
    if (!isValid) return;

    try {
      let success = false;
      if (isEditMode && educationFormData._id) {
        success = await updateEducation(educationFormData._id, educationFormData);
      } else {
        success = await addEducation(educationFormData);
      }

      if (success) {
        // Reset education form
        setEducationFormData({
          class_name: '',
          year: '',
          institute: '',
          prodile_id: educationFormData.prodile_id
        });
        fetchEducations();
      } else {
        toast.error("Education operation failed");
      }
    } catch (error) {
      console.error("Error in handleEducationSubmit:", error);
      toast.error("Error adding education record");
    }
  };


  const handleDeathSubmit = async (e) => {
    e.preventDefault();

    // First, check if we have a prodile_id
    if (!deathFormData.prodile_id && !selectedPersonId) {
      // Show error using the form errors
      useDeathStore.setState({
        formErrors: {
          ...useDeathStore.getState().deathFormErrors,
          prodile_id: "Please select a person first"
        }
      });
      toast.error("Please select a person first");
      return;
    }

    // If we don't have prodile_id but have currentPersonId, set it
    if (!deathFormData.prodile_id && selectedPersonId) {
      // Update the form data with the current person ID
      const updatedFormData = {
        ...deathFormData,
        prodile_id: selectedPersonId
      };

      // Use the updated form data directly instead of waiting for state update
      const isValid = validatedeathForm();
      if (!isValid) return;

      try {
        let success = false;
        if (isEditMode && updatedFormData._id) {
          success = await updatedeath(updatedFormData._id, updatedFormData);
        } else {
          success = await adddeath(updatedFormData);
        }

        if (success) {
          // Reset education form but keep the prodile_id
          setdeathFormData({
            death_date: '',
            death_reason: '',
            death_place: '',
            prodile_id: selectedPersonId
          });
          fetchdeaths();
        } else {
          toast.error("Education operation failed");
        }
      } catch (error) {
        console.error("Error in handleDeathSubmit:", error);
        toast.error("Error adding Death record");
      }
      return;
    }

    // Normal flow when we already have profile_id
    const isValid = validatedeathForm();
    if (!isValid) return;

    try {
      let success = false;
      if (isEditMode && deathFormData._id) {
        success = await updatedeath(deathFormData._id, deathFormData);
      } else {
        success = await adddeath(deathFormData);
      }

      if (success) {
        // Reset education form
        setdeathFormData({
          death_date: '',
          death_reason: '',
          death_place: '',
          prodile_id: deathFormData.prodile_id
        });
        fetchdeaths();
      } else {
        toast.error("death operation failed");
      }
    } catch (error) {
      console.error("Error in handledeathSubmit:", error);
      toast.error("Error adding death record");
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


        {isModalOpen === false ? (
          <div style={{ marginTop: "10px" }} class="row">
            <div class="col-12">
              <ul className="nav nav-tabs bg-dark rounded-top rounded-bottom">
                <li style={{ marginLeft: "10px" }} className="nav-item">
                  <a
                    className={`nav-link text-white ${activeTab === 'person-details' ? 'active' : ''}`}
                    data-bs-toggle="tab"
                    href="#person-details-tab"
                    onClick={() => setActiveTab('person-details')}
                  >
                    Users Data
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link text-white ${activeTab === 'education-detail' ? 'active' : ''}`}
                    data-bs-toggle="tab"
                    href="#education-detail-tab"
                    onClick={() => setActiveTab('education-detail')}
                  >
                    Marriage Data
                  </a>
                </li>
              </ul>
              <div class="tab-content">
                {activeTab === 'person-details' && (
                  <div id="person-details-tab" className="tab-pane fade show active">

                    <PersonDataTable
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
                    <MarriageDataTable
                      currentPersons={currentMarriages}
                      persons={relationship}
                      loading={loading}
                      searchQuery={searchMrrigeQuery}
                      offset={offsset}
                      personsPerPage={marriagePerPage}
                      filteredPersons={filteredMarriages}
                      handleSearchChange={handleMarriageSearchChange}
                      handlePageClick={handlesPageClick}
                      openDeleteModal={opensDeleteModal}
                      handleEdit={handleEdit}
                    />
                  </div>
                )}




              </div>
            </div>
          </div>

        ) : (

          <div style={{ marginTop: "10px" }} class="row">
            <div class="col-12">
              <ul className="nav nav-tabs bg-dark rounded-top rounded-bottom">
                <li style={{ marginLeft: "10px" }} className="nav-item">
                  <a
                    className={`nav-link text-white ${activeTab === 'person-details' ? 'active' : ''}`}
                    data-bs-toggle="tab"
                    href="#person-details-tab"
                    onClick={() => setActiveTab('person-details')}
                  >
                    Person Details
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link text-white ${activeTab === 'education-detail' ? 'active' : ''}`}
                    data-bs-toggle="tab"
                    href="#education-detail-tab"
                    onClick={() => setActiveTab('education-detail')}
                  >
                    Education Detail
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link text-white ${activeTab === 'death-detail' ? 'active' : ''}`}
                    data-bs-toggle="tab"
                    href="#death-detail-tab"
                    onClick={() => setActiveTab('death-detail')}
                  >
                    Death Detail
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link text-white ${activeTab === 'marriage-detail' ? 'active' : ''}`}
                    data-bs-toggle="tab"
                    href="#marriage-detail-tab"
                    onClick={() => setActiveTab('marriage-detail')}
                  >
                    Marriage Detail
                  </a>
                </li>
              </ul>
              <div class="tab-content">
                {activeTab === 'person-details' && (
                  <div id="person-details-tab" className="tab-pane fade show active">

                    <div class="card card-bordered card-preview">

                      <div class="card-inner-group">

                        <div class="card-inner">
                          <div class="card-title-group">
                            <div class="card-title">
                              <h5 class="title">Add Person Details</h5>
                            </div>
                          </div>
                        </div>
                        <div class="card-inner p-0">
                          <form onSubmit={handleSubmit}>
                            <div className="modal-body pt-3">
                              {usePersonStore.getState().error && (
                                <div className="alert alert-danger">
                                  {usePersonStore.getState().error}
                                </div>
                              )}
                              <div className="row">
                                <div className="col-md-6">
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
                                <div className="col-md-6">
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
                                <div className="col-md-6">
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
                                <div className="col-md-6">
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
                                <div className="col-md-6">
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
                                <div className="col-md-6">
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
                                <div className="col-md-6">
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
                                <div className="col-md-6">
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
                                <div className="col-md-6">
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
                                <div className="col-md-6">
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
                                <div className="col-md-6">
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
                                <div className="col-md-6">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Father ID</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="father_id"
                                        className="form-control form-control-lg"
                                        placeholder="Enter father ID"
                                        value={formData.father_id || ""}
                                        onChange={handleInputChange}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Mother ID</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="mother_id"
                                        className="form-control form-control-lg"
                                        placeholder="Enter mother ID"
                                        value={formData.mother_id || ""}
                                        onChange={handleInputChange}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Grandfather ID</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="gr_father_id"
                                        className="form-control form-control-lg"
                                        placeholder="Enter grandfather ID"
                                        value={formData.gr_father_id || ""}
                                        onChange={handleInputChange}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Grandmother ID</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="gr_mother_id"
                                        className="form-control form-control-lg"
                                        placeholder="Enter grandmother ID"
                                        value={formData.gr_mother_id || ""}
                                        onChange={handleInputChange}
                                      />
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
                )}
                {activeTab === 'education-detail' && (
                  <div id="education-detail-tab" className="tab-pane fade show active">
                    <div class="card card-bordered card-preview">
                      <div class="card-inner-group">
                        <div class="card-inner">
                          <div class="card-title-group">
                            <div class="card-title">
                              <h5 class="title">Add Eduction Details</h5>
                            </div>
                            <div class="card-tools mr-n1">
                              <ul class="btn-toolbar">
                                <li>
                                  <a href="javascript:void(0)" class="btn btn-icon search-toggle toggle-search" data-target="search"><em class="icon ni ni-search"></em></a>
                                </li>
                                <li class="btn-toolbar-sep"></li>
                                <li>
                                  <div class="dropdown">
                                    <a href="javascript:void(0)" class="btn btn-trigger btn-icon dropdown-toggle" data-toggle="dropdown">
                                      <em class="icon ni ni-setting"></em>
                                    </a>
                                    <div class="dropdown-menu dropdown-menu-right dropdown-menu-xs">
                                      <ul class="link-check">
                                        <li><span>Show</span></li>
                                        <li ng-click="itemsOnPage(10)"><a class="{{itemsPerPage==10?'active':''}}" href="javascript:void(0)">10</a></li>
                                        <li ng-click="itemsOnPage(20)"><a class="{{itemsPerPage==20?'active':''}}" href="javascript:void(0)">20</a></li>
                                        <li ng-click="itemsOnPage(50)"><a class="{{itemsPerPage==50?'active':''}}" href="javascript:void(0)">50</a></li>
                                      </ul>
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </div>
                            <div class="card-search search-wrap" data-search="search">
                              <div class="search-content">
                                <a href="javascript:void(0)" class="search-back btn btn-icon toggle-search" data-target="search"><em class="icon ni ni-arrow-left"></em></a>
                                {/* <input type="text" ng-model="searchTextRunning" class="form-control form-control-sm border-transparent form-focus-none" placeholder="Search..."> */}
                                <button class="search-submit btn btn-icon"><em class="icon ni ni-search"></em></button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="card-inner p-0">
                          <form onSubmit={handleEducationSubmit}>
                            <div className="modal-body pt-3">
                              {useEducationStore.getState().error && (
                                <div className="alert alert-danger">
                                  {useEducationStore.getState().error}
                                </div>
                              )}
                              <div className="row">
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Class Name</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="class_name"
                                        className={`form-control form-control-lg ${educationFormErrors.class_name ? 'is-invalid' : ''}`}
                                        placeholder="Enter class name"
                                        value={educationFormData.class_name || ""}
                                        onChange={handleEducationInputChange}
                                      />
                                      {educationFormErrors.class_name && (
                                        <div className="invalid-feedback">{educationFormErrors.class_name}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Year</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="year"
                                        className={`form-control form-control-lg ${educationFormErrors.year ? 'is-invalid' : ''}`}
                                        placeholder="Enter year"
                                        value={educationFormData.year || ""}
                                        onChange={handleEducationInputChange}
                                      />
                                      {educationFormErrors.year && (
                                        <div className="invalid-feedback">{educationFormErrors.year}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Institute</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="institute"
                                        className={`form-control form-control-lg ${educationFormErrors.institute ? 'is-invalid' : ''}`}
                                        placeholder="Enter institute name"
                                        value={educationFormData.institute || ""}
                                        onChange={handleEducationInputChange}
                                      />
                                      {educationFormErrors.institute && (
                                        <div className="invalid-feedback">{educationFormErrors.institute}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label">
                                      <span>Select Person</span>
                                    </label>
                                    <div className="form-control-wrap">
                                      <select
                                        name="prodile_id"
                                        className={`form-control form-control-lg ${educationFormErrors.prodile_id ? 'is-invalid' : ''}`}
                                        value={educationFormData.prodile_id || ''}
                                        onChange={handleEducationInputChange}
                                      >
                                        <option value="">Select a person</option>
                                        {currentPersons.length > 0 ? (
                                          currentPersons.map((person) => (
                                            <option key={person.pid} value={person.pid}>
                                              {person.first_name + " " + person.last_name}
                                            </option>
                                          ))
                                        ) : (
                                          <option value="" disabled>No persons available</option>
                                        )}
                                      </select>
                                      {educationFormErrors.prodile_id && (
                                        <div className="invalid-feedback">{educationFormErrors.prodile_id}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row mt-2" style={{ borderTop: "1px solid #ede8e8" }}>
                                <div className="col-md-9"></div>
                                <div className="col-md-3 text-right pt-2">
                                  <button type="submit" className="btn btn-primary w-100 justify-center" disabled={educationLoading}>
                                    {educationLoading ? (
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
                )}


                {activeTab === 'death-detail' && (
                  <div id="death-detail-tab" className="tab-pane fade show active">
                    <div class="card card-bordered card-preview">
                      <div class="card-inner-group">
                        <div class="card-inner">
                          <div class="card-title-group">
                            <div class="card-title">
                              <h5 class="title">Add Death Details</h5>
                            </div>
                            <div class="card-tools mr-n1">
                              <ul class="btn-toolbar">
                                <li>
                                  <a href="javascript:void(0)" class="btn btn-icon search-toggle toggle-search" data-target="search"><em class="icon ni ni-search"></em></a>
                                </li>
                                <li class="btn-toolbar-sep"></li>
                                <li>
                                  <div class="dropdown">
                                    <a href="javascript:void(0)" class="btn btn-trigger btn-icon dropdown-toggle" data-toggle="dropdown">
                                      <em class="icon ni ni-setting"></em>
                                    </a>
                                    <div class="dropdown-menu dropdown-menu-right dropdown-menu-xs">
                                      <ul class="link-check">
                                        <li><span>Show</span></li>
                                        <li ng-click="itemsOnPage(10)"><a class="{{itemsPerPage==10?'active':''}}" href="javascript:void(0)">10</a></li>
                                        <li ng-click="itemsOnPage(20)"><a class="{{itemsPerPage==20?'active':''}}" href="javascript:void(0)">20</a></li>
                                        <li ng-click="itemsOnPage(50)"><a class="{{itemsPerPage==50?'active':''}}" href="javascript:void(0)">50</a></li>
                                      </ul>
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </div>
                            <div class="card-search search-wrap" data-search="search">
                              <div class="search-content">
                                <a href="javascript:void(0)" class="search-back btn btn-icon toggle-search" data-target="search"><em class="icon ni ni-arrow-left"></em></a>
                                {/* <input type="text" ng-model="searchTextRunning" class="form-control form-control-sm border-transparent form-focus-none" placeholder="Search..."> */}
                                <button class="search-submit btn btn-icon"><em class="icon ni ni-search"></em></button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="card-inner p-0">
                          <form onSubmit={handleDeathSubmit}>
                            <div className="modal-body pt-3">
                              {useDeathStore.getState().error && (
                                <div className="alert alert-danger">
                                  {useDeathStore.getState().error}
                                </div>
                              )}
                              <div className="row">
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Death Place</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="death_place"
                                        className={`form-control form-control-lg ${deathFormErrors.death_place ? 'is-invalid' : ''}`}
                                        placeholder="Enter death place"
                                        value={deathFormData.death_place || ""}
                                        onChange={handleDeathInputChange}
                                      />
                                      {deathFormErrors.death_place && (
                                        <div className="invalid-feedback">{deathFormErrors.death_place}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Death Reason</span></label>
                                    <div className="form-control-wrap">
                                      <input
                                        type="text"
                                        name="death_reason"
                                        className={`form-control form-control-lg ${deathFormErrors.death_reason ? 'is-invalid' : ''}`}
                                        placeholder="Enter death reason"
                                        value={deathFormData.death_reason || ""}
                                        onChange={handleDeathInputChange}
                                      />
                                      {deathFormErrors.death_reason && (
                                        <div className="invalid-feedback">{deathFormErrors.death_reason}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label">
                                      <span>Select Person</span>
                                    </label>
                                    <div className="form-control-wrap">
                                      <select
                                        name="prodile_id"
                                        className={`form-control form-control-lg ${deathFormErrors.prodile_id ? 'is-invalid' : ''}`}
                                        value={deathFormData.prodile_id || ''}
                                        onChange={handleDeathInputChange}
                                      >
                                        <option value="">Select a person</option>
                                        {currentPersons.length > 0 ? (
                                          currentPersons.map((person) => (
                                            <option key={person.pid} value={person.pid}>
                                              {person.first_name + " " + person.last_name}
                                            </option>
                                          ))
                                        ) : (
                                          <option value="" disabled>No persons available</option>
                                        )}
                                      </select>
                                      {deathFormErrors.prodile_id && (
                                        <div className="invalid-feedback">{deathFormErrors.prodile_id}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Death Date</span></label>
                                    <div className="form-control-wrap">
                                      <DatePicker
                                        selected={deathFormData.death_date}
                                        onChange={handleDeathDateChange}
                                        className={`form-control form-control-lg ${deathFormErrors.death_date ? 'is-invalid' : ''}`}
                                        placeholderText="Select death date"
                                        dateFormat="yyyy-MM-dd" // Customize the date format as needed
                                      />
                                      {deathFormErrors.death_date && (
                                        <div className="invalid-feedback">{deathFormErrors.death_date}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row mt-2" style={{ borderTop: "1px solid #ede8e8" }}>
                                <div className="col-md-9"></div>
                                <div className="col-md-3 text-right pt-2">
                                  <button type="submit" className="btn btn-primary w-100 justify-center" disabled={deathLoading}>
                                    {deathLoading ? (
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
                )}

                {activeTab === 'marriage-detail' && (
                  <div id="marriage-detail-tab" className="tab-pane fade show active">
                    <div class="card card-bordered card-preview">
                      <div class="card-inner-group">
                        <div class="card-inner">
                          <div class="card-title-group">
                            <div class="card-title">
                              <h5 class="title">Add Marriage Details</h5>
                            </div>
                            <div class="card-tools mr-n1">
                              <ul class="btn-toolbar">
                                <li>
                                  <a href="javascript:void(0)" class="btn btn-icon search-toggle toggle-search" data-target="search"><em class="icon ni ni-search"></em></a>
                                </li>
                                <li class="btn-toolbar-sep"></li>
                                <li>
                                  <div class="dropdown">
                                    <a href="javascript:void(0)" class="btn btn-trigger btn-icon dropdown-toggle" data-toggle="dropdown">
                                      <em class="icon ni ni-setting"></em>
                                    </a>
                                    <div class="dropdown-menu dropdown-menu-right dropdown-menu-xs">
                                      <ul class="link-check">
                                        <li><span>Show</span></li>
                                        <li ng-click="itemsOnPage(10)"><a class="{{itemsPerPage==10?'active':''}}" href="javascript:void(0)">10</a></li>
                                        <li ng-click="itemsOnPage(20)"><a class="{{itemsPerPage==20?'active':''}}" href="javascript:void(0)">20</a></li>
                                        <li ng-click="itemsOnPage(50)"><a class="{{itemsPerPage==50?'active':''}}" href="javascript:void(0)">50</a></li>
                                      </ul>
                                    </div>
                                  </div>
                                </li>
                              </ul>
                            </div>
                            <div class="card-search search-wrap" data-search="search">
                              <div class="search-content">
                                <a href="javascript:void(0)" class="search-back btn btn-icon toggle-search" data-target="search"><em class="icon ni ni-arrow-left"></em></a>
                                {/* <input type="text" ng-model="searchTextRunning" class="form-control form-control-sm border-transparent form-focus-none" placeholder="Search..."> */}
                                <button class="search-submit btn btn-icon"><em class="icon ni ni-search"></em></button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="card-inner p-0">
                          <form onSubmit={handleReltionshipSubmit}>
                            <div className="modal-body pt-3">
                              {useRelationshipStore.getState().error && (
                                <div className="alert alert-danger">
                                  {useRelationshipStore.getState().error}
                                </div>
                              )}
                              <div className="row">
                                <div className="col-md-3">
                                  <div className="form-group mt-1">
                                    <label className="form-label">
                                      <span>Select Profile1</span>
                                    </label>
                                    <div className="form-control-wrap">
                                      <div className="d-flex justify-content-between align-items-center">
                                        <div className="form-control form-control-lg">
                                          {RelationshipFormData.person1_id
                                            ? `${RelationshipFormData.person1.first_name} ${RelationshipFormData.person1.last_name} (${RelationshipFormData.person1.cnic})`
                                            : 'No person selected'}
                                        </div>
                                        <button
                                          className="btn btn-primary ml-2"
                                          type="button"
                                          onClick={() => openSerchModal('person1_id')}
                                        >
                                          Choose
                                        </button>
                                      </div>
                                      {RelationshipFormErrors.person1_id && (
                                        <div className="invalid-feedback">{RelationshipFormErrors.person1_id}</div>
                                      )}
                                    </div>

                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="form-group mt-1">
                                    <label className="form-label">
                                      <span>Select Profile2</span>
                                    </label>
                                    <div className="form-control-wrap">
                                      <div className="d-flex justify-content-between align-items-center">
                                        <div className="form-control form-control-lg">
                                          {RelationshipFormData.person2_id
                                            ? `${RelationshipFormData.person1.first_name} ${RelationshipFormData.person1.last_name} (${RelationshipFormData.person1.cnic})`
                                            : 'No person selected'}
                                        </div>
                                        <button
                                          className="btn btn-primary ml-2"
                                          type="button"
                                          onClick={() => openSerchModal('person2_id')}
                                        >
                                          Choose
                                        </button>
                                      </div>
                                      {RelationshipFormErrors.person2_id && (
                                        <div className="invalid-feedback">{RelationshipFormErrors.person2_id}</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Relationship Type</span></label>
                                    <div className="form-control-wrap">
                                      <select
                                        name="relationship_type"
                                        className="form-control form-control-lg"
                                        value={RelationshipFormData.relationship_type || "Single"}
                                        onChange={handleReltionshipInputChange}
                                      >
                                        {MARRIAGE_STATUS.map(status => (
                                          <option key={status} value={status}>{status}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-4">
                                  <div className="form-group mt-1">
                                    <label className="form-label"><span>Status</span></label>
                                    <div className="form-control-wrap">
                                      <select
                                        name="status"
                                        className="form-control form-control-lg"
                                        value={RelationshipFormData.status || "Active"} // Default to "Single"
                                        onChange={handleReltionshipInputChange}
                                      >
                                        {/* Manually adding options for Active, Inactive, etc. */}

                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="row mt-2" style={{ borderTop: "1px solid #ede8e8" }}>
                                <div className="col-md-9"></div>
                                <div className="col-md-3 text-right pt-2">
                                  <button type="submit" className="btn btn-primary w-100 justify-center" disabled={RelationshipLoading}>
                                    {RelationshipLoading ? (
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
                )}


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

        {isDeleteMrrigeModalOpen && (
          <MarriageDeleteModal
            personToDelete={mrriageToDelete}
            loading={loading}
            setCloseDeleteModal={setClosesDeleteModal}
            handleDelete={handlesDelete}
          />
        )}

        {isSearchModalOpen && (
          <SearchProfileModal
            currentPersons={filteredProfiles}
            loading={loading}
            isEditMode={isEditMode}
            searchQuery={searchProfileQuery}
            handleSearchChange={handleSearchProfileChange}
            handlePageClick={handlePageClick}
            offset={offset}
            close={closeSerchModal}
            handleSelectPerson={(person) => handleSelectPerson(currentProfileKey, person)}
            clearList={removeFilterList}
          />
        )}
      </div>
    </div>
  );
}

export default Page;
