"use client";
import React, { useState, useEffect } from "react";
import UserCard from "../../../componenet/user_profile";
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import usePersonStore from '../../../stores/profile_stores';
import useEducationStore from '../../../stores/Education_store';
import useProfileStore from '../../../stores/profile_stores';
import useDeathStore from '../../../stores/death_store';
import useRelationshipStore from '../../../stores/relationship_store';
import DatePicker from 'react-datepicker';
import DeleteModal from "../../../componenet/DeleteModal/delete_modal";
import SearchProfileModal from "../../../componenet/SearchProfileModal";
import { useRouter } from 'next/navigation'; // Correct import for App Router
import ProfileDataTable from "../../../componenet/profile_table";
import DynamicTable from "../../../componenet/DataTables/dynamicTable";


interface PageProps {
  params: {
    userId: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

export default function PersonDetailsPage({ params }: PageProps) {

  const id = params.userId;
  const {
    persons,
    data,
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
    getuserRecord,
    getSinglePerson,
    getUserChildrenData: fetchRecords,
    singlePerson
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
    death,
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
  const [isSearchProfileModalOpen, setIsSearchProfileModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEducationDeleteModalOpen, setIsEducationDeleteModalOpen] = useState(false);
  const [isDeathDeleteModalOpen, setIsDeathDeleteModalOpen] = useState(false);

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

  const [fatherId, setselectedFather] = useState("");
  const [motherId, setselectedMother] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Manage menu state
  const [profiles, setProfiles] = useState(persons); // All records
  const [filteredProfiles, setFilteredProfiles] = useState([]); // Filtered result
  const [currentProfileKey, setCurrentProfileKey] = useState('');
  const [searchText, setSearchText] = useState("");
  const [person, setProfile] = useState(null); // Global in this component
  const [marriageList, setMarriageList] = useState([]); // For direct marriage records
  const person1Profile = [];
  const person2Profile = [];
  const [ProfileKey, setProfileKey] = useState('');
  const [FormErrors, setFormErrors] = useState({});
  const [showButton, setIsShowButton] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
   const [education, setEducation] = useState(null);
     const [marriageMode, setMarriageMode] = useState(false);


  const setRecordInfields=()=>{
    if (!singlePerson || !singlePerson._id) {
      // toast.error("Cannot edit: No valid person data available");
      return;
    }
    
    // Validate MongoDB ID format
    if (!/^[0-9a-fA-F]{24}$/.test(singlePerson._id)) {
      // toast.error("Invalid person ID format");
      return;
    }
    
    setEditMode(true);
    // Log the current singlePerson data for debugging
    console.log("Setting form data from:", {
      id: singlePerson._id,
      father_id: singlePerson.father_id,
      mother_id: singlePerson.mother_id,
      gr_father_id: singlePerson.gr_father_id,
      gr_mother_id: singlePerson.gr_mother_id
    });
    
    setFormData({
      _id: singlePerson._id,
      first_name: singlePerson?.first_name || '',
      last_name: singlePerson?.last_name || '',
      cnic: singlePerson?.cnic || '',
      birth_date: singlePerson?.birth_date?.split('T')[0] || '',
      contact: singlePerson?.contact || '',
      email: singlePerson?.email || '',
      blood_group: singlePerson?.blood_group || '',
      marital_status: singlePerson?.marital_status || '',
      birth_place: singlePerson?.birth_place || '',
      occupation: singlePerson?.occupation || '',
      alive: singlePerson?.alive ?? false,
      image: singlePerson?.image ?? "",
      gender: singlePerson?.gender || '',
      // Ensure parent IDs are properly set
      gr_father_id: singlePerson?.gr_father_id || '',
      gr_mother_id: singlePerson?.gr_mother_id || '',
      father_id: singlePerson?.father_id || '',
      mother_id: singlePerson?.mother_id || ''
    });
    
    console.log("Form data set with ID:", singlePerson._id);
  }

  const closeFormModl=()=>{
    setEditMode(false);
  }

   const showMarriageWidget=()=>{
    setMarriageMode(true);
  }

  const handleRelationshipEdit = (relationship) => {
  if (!relationship) {
    console.warn("❌ No relationship object provided to edit.");
    return;
  }

  setRelationshipFormData({
    _id: relationship._id, // important for PUT updates
    person1_id: relationship.person1_id ?? '',
    person2_id: relationship.person2_id ?? '',
    rid: relationship.rid ?? '',
    date: relationship.date ?? new Date().toISOString().split("T")[0],
    relationship_type: relationship.relationship_type ?? '',
  });

  setIsEditMode(true);  // ensure this happens before you log
  setMarriageMode(true);

  console.log("🟡 Edit Mode Activated. Form data set to:", {
    _id: relationship._id,
    person1_id: relationship.person1_id,
    person2_id: relationship.person2_id,
    rid: relationship.rid,
    date: relationship.date,
    relationship_type: relationship.relationship_type,
  });
};


   const closeMarriageWidget=()=>{
    setMarriageMode(false);
  }

  // Search input typing
  const handleInputChanges = (text) => {
    setSearchText(text);
  };

  const closeForm = () => {
    setIsEditMode(false);
    console.log("edit mode",isEditMode);
    setEducationFormData({
       prodile_id:  '',
        _id:  '',
        class_name:  '',
        year:  '',
        institute:  ''
    })
    setIsShowButton(false);
  }

   const closesForm = () => {
    setIsEditMode(false);
    console.log("edit mode",isEditMode);
    setEducationFormData({
       prodile_id:  '',
        _id:  '',
        death_place:  '',
        death_reason:  '',
        death_date:  ''
    })
    setIsShowButton(false);
  }

  const openFormModalEduction=()=>{
    setIsShowButton(true);
  }

  const modifyButton = (education) => {
    console.log("Modifying education record:", education);
    
    setIsShowButton(true);
    setIsEditMode(true);

    // Check if education exists and is an object before accessing its properties
    if (education && typeof education === 'object') {
      // Set form data with the selected education record
      setEducationFormData({
        prodile_id: education.prodile_id || singlePerson?.pid || id || '',
        _id: education._id || '', // Add _id for update operation
        class_name: education.class_name || '',
        year: education.year || '',
        institute: education.institute || ''
      });
      console.log("Setting education form data for edit:", education);
    } else {
      // Set default form data with current person's ID for new record
      setEducationFormData({
        prodile_id: singlePerson?.pid || id || '',
        class_name: '',
        year: '',
        institute: ''
      });
      console.log("Setting default education form data for new record with profile ID:", singlePerson?.pid || id);
    }
  };

   const modifyDethButton = (death) => {
    console.log("Modifying death record:", death);
    
    setIsShowButton(true);
    setIsEditMode(true);

    // Check if death exists and is an object before accessing its properties
    if (death && typeof death === 'object') {
      // Set form data with the selected death record
      setdeathFormData({
        profile_id: death.prodile_id || death.profile_id || singlePerson?.pid || id || '',
        _id: death._id || '', // Add _id for update operation
        death_place: death.death_place || '',
        death_reason: death.death_reason || '',
        death_date: death.death_date || ''
      });
      console.log("Setting death form data for edit:", death);
    } else {
      // Set default form data with current person's ID for new record
      setdeathFormData({
        profile_id: singlePerson?.pid || id || '',
        _id: '', 
        death_place: '',
        death_reason: '',
        death_date: ''
      });
      console.log("Setting default death form data for new record with profile ID:", singlePerson?.pid || id);
    }
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
      // setOffset(0);
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
    // Ensure we only accept 'person1_id' or 'person2_id' as valid keys
    if (key !== 'person1_id') {
      console.error('Invalid key:', key);
      return;
    }

    
    // Validate we actually got an ID
    if (!data.pid) {
      console.error('No valid ID provided');
      return;
    }

    // Update individual person states if needed
    if (key === "person1_id") {
      setselectedPersonId1(data.pid);
    }

    // ✅ This will work for your current store
    setRelationshipFormData({ 
      [key]: data.pid 
    });
    // Reset search and close modal
    //filteredProfiles.clear.();
    closeSerchModal();

  };


  const handlesSelectPerson = (key, data) => {
    // Ensure we only accept 'person1_id' or 'person2_id' as valid keys
    if (key !== 'father_id' && key !== 'mother_id') {
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
    if (key === "father_id") {
      setselectedFather(stringPid);
    } else {
      setselectedMother(stringPid);
    }

     // ✅ This will work for your current store
setFormData({ 
  father_id: singlePerson.pid,
  [key]: data.pid 
});

    // Reset search and close modal
    //filteredProfiles.;
    closesModal();

  };


const handleReltionshipSubmit = async (e) => {
  e.preventDefault();
  console.log("🟡 Submit triggered");

  const isUpdate = isEditMode && RelationshipFormData._id;

  const finalFormData = {
    ...RelationshipFormData,
    rid: RelationshipFormData.rid,
    person1_id: selectedPersonId1 ?? RelationshipFormData.person1_id,
    person2_id: singlePerson.pid,
    date: RelationshipFormData.date,
  };

  console.log("🟡 Constructed finalFormData:", finalFormData);

  // Validation: person1 must be selected
  if (!finalFormData.person1_id) {
    useRelationshipStore.setState({
      formErrors: {
        ...useRelationshipStore.getState().formErrors,
        person1_id: "Please select person 1 first",
      },
    });
    toast.error("Please select person 1 first");
    return;
  }

  // Validation: cannot relate person to themselves
  if (finalFormData.person1_id === finalFormData.person2_id) {
    toast.error("Cannot create a relationship with the same person");
    return;
  }

  // Form validation
  const isValid = validateRelationshipForm(finalFormData);
  if (!isValid) {
    console.warn("🔴 Validation failed");
    return;
  }

  try {
    console.log("🟢 Calling store method for API submission");

    

    const isSuccess = isUpdate
      ? await updateRelationship(finalFormData.rid, finalFormData)
      : await addRelationship(finalFormData);

    if (isSuccess) {
      toast.success(`Relationship ${isUpdate ? "updated" : "created"} successfully`);

      setRelationshipFormData({
        person1_id: "",
        person2_id: "",
        relationship_type: "",
        date: "",
      });

      fetchRelationship();
      setMarriageMode(false);
    } else {
      throw new Error("API call returned unsuccessful response.");
    }
  } catch (error) {
    console.error("🔴 Error in handleReltionshipSubmit:", error);
    toast.error(error.message || "Error submitting relationship record");
  }
};




  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleMarriageSearchChange = (e) => {
    setSearchMarriageQuery(e.target.value);
  };

  const handleDeleteEducationDetail = async (personId) => {
    try {
      console.log('Deleting education record with ID:', personId);
      const success = await deleteEducation(personId);
      if (success) {
        setEducationCloseDeleteModal();
        console.log('Education record deleted successfully');
        // Refresh education records after deletion
        fetchEducations(singlePerson?.pid);
      } else {
        console.error('Failed to delete education record');
      }
    } catch (error) {
      console.error('Error in handleDeleteEducationDetail:', error);
    }
  };
  
  const handleDeleteDeathDetail = async (personId) => {
    try {
      console.log('Deleting death record with ID:', personId);
      const success = await deletedeath(personId);
      if (success) {
        setDeathCloseDeleteModal();
        console.log('Death record deleted successfully');
        // Refresh death records after deletion
        fetchdeaths();
      } else {
        console.error('Failed to delete death record');
      }
    } catch (error) {
      console.error('Error in handleDeleteDeathDetail:', error);
    }
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
    // Fetch the profile data first
    fetchCustomers({ page: pagination.page });
    getSinglePerson(id);
    
    // Fetch education and death records for this specific user
    if (id) {
      console.log(`Fetching data for user ID: ${id}`);
      fetchEducations(id);
      fetchdeaths(id);
      fetchRelationship();
      fetchRecords(id);
      openMngeModal(singlePerson);
    }

    console.log("relationship data:", relationship);
  }, [id]);

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
      fetchEducations(currentPersonId);
    }
  }, [currentPersonId]);
  
  // Fetch education and death records when singlePerson changes
  useEffect(() => {
    if (singlePerson && singlePerson.pid) {
      console.log(`Fetching education and death records for user with pid: ${singlePerson.pid}`);
      fetchEducations(singlePerson.pid);
      fetchdeaths(singlePerson.pid);
    }
  }, [singlePerson]);

  const openSerchModal = (key) => {
    setCurrentProfileKey(key);
    setIsSearchModalOpen(true);
  };

  const opensSerchModal = (key) => {
    setProfileKey(key);
    setIsSearchProfileModalOpen(true);
  };

 const openModal = () => {
  if (!singlePerson || !singlePerson.gender || !singlePerson.pid) {
    console.warn("Missing person data");
    return;
  }

  if (singlePerson.gender === "Male") {
    setFormData({ father_id: singlePerson.pid });
  } else {
    setFormData({ mother_id: singlePerson.pid });
  }

  setIsModalOpen(true);
};


  const openMngeModal = async (person) => {
    console.log("Selected profile:", id);
    try {
      // toast.info("Fetching marriage data...");

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

      const marriageData = await fetchMarriageData(id);
      console.log("Marriage Records fetched:", marriageData);

      setProfile(person);


      // toast.success("Marriage data loaded successfully");
    } catch (error) {
      console.error("Error fetching marriage data:", error);
      // toast.error("Failed to fetch marriage data");

      setProfile(person);

    }
  };

  const closesModal = () => {
    setIsSearchProfileModalOpen(false);
  }
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
  
  const setDeathCloseDeleteModal = () => {
    setIsDeathDeleteModalOpen(false);
    setPersonToDelete(null);
  };

  const openDeathDeleteModal = (person) => {
    setPersonToDelete(person);
    setIsDeathDeleteModalOpen(true);
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
      image: singlePerson.image,
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

  const handlesDateChange = (dates) => {
    setRelationshipFormData({ date: dates });
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
    setIsSearchModalOpen(false);
    setSearchProfileQuery('');
  };

  const closesSearchModal = () => {
    setIsSearchProfileModalOpen(false);
    setSearchProfileQuery('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    try {
      let success = false;
      
      if (editMode) {
        // For profile update in the basic info tab
        if (!formData._id || !/^[0-9a-fA-F]{24}$/.test(formData._id)) {
           toast.error("Invalid person ID format");
          return;
        }
        
        // Log the form data being submitted
        console.log("Updating profile with ID:", formData._id);
        console.log("Form data being submitted:", {
          ...formData,
          father_id: formData.father_id,
          mother_id: formData.mother_id,
          gr_father_id: formData.gr_father_id,
          gr_mother_id: formData.gr_mother_id
        });
        
        success = await updateCustomer(formData._id);
        
        if (success) {
          // Refresh the single person data
          await getSinglePerson(id);
          toast.success("Profile updated successfully!");
          setEditMode(false);
        }
      } else if (isEditMode && currentPersonId) {
        // For modal form update
        if (!/^[0-9a-fA-F]{24}$/.test(currentPersonId)) {
          toast.error("Invalid person ID format");
          return;
        }
        
        success = await updateCustomer(currentPersonId);
        if (success) {
          closeModal();
          fetchCustomers();
        }
      } else {
        // For adding new person
        success = await addCustomer(formData);
        if (success) {
          closeModal();
          fetchCustomers();
        }
      }

      if (!success) {
        console.error("Operation failed");
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An error occurred while updating the profile");
    }
  };

  const handleEducationSubmit = async (e) => {
    e.preventDefault();

    if (!singlePerson) {
      useEducationStore.setState({
        formErrors: {
          ...useEducationStore.getState().formErrors,
          prodile_id: "Please select a person first"
        }
      });
      toast.error("Please select a person first");
      return;
    }

    // Prepare updated form data with profile ID if missing
    const formData = {
      ...educationFormData,
      prodile_id: singlePerson.pid
    };
    console.log("formdata", formData);

    // Validate form
    const isValid = validateEducationForm();
    if (!isValid) return;
    console.log("isvalid", isValid);

    try {
      let success = false;

      if (isEditMode && educationFormData._id) {
        // Make sure we're passing the MongoDB _id for the update
        console.log("Updating education with ID:", educationFormData._id);

        // Create a complete update object with both _id and other fields
        const updateData = {
          ...formData,
          _id: educationFormData._id // Ensure _id is included
        };

        success = await updateEducation(educationFormData._id, updateData);
      } else {
        // Otherwise add new record
        console.log("Adding new education record");
        success = await addEducation(formData);
      }

      if (success) {
        setEducationFormData({
          class_name: '',
          year: '',
          institute: '',
          prodile_id: singlePerson.pid
        });
        fetchEducations();
      } else {
        toast.error("Education operation failed");
      }
    } catch (error) {
      console.error("Error in handleEducationSubmit:", error);
      toast.error("Error saving education record");
    }
  };

  const handleDeathSubmit = async (e) => {
    e.preventDefault();

    // Check if we have a profile_id (corrected variable name)
    if (!singlePerson) {
      // Show error using the form errors
      useDeathStore.setState({
        formErrors: {
          ...useDeathStore.getState().deathFormErrors,
          prodile_id: "Please select a person first",
        },
      });
      toast.error("Please select a person first");
      return;
    }

    // Ensure profile_id is set in form data if missing
    const formDataToSubmit = {
      ...deathFormData,
      prodile_id: id,
    };
    console.log("formdata", formDataToSubmit);


    // Validate the form with updated data
    const isValid = validatedeathForm(formDataToSubmit);
    if (!isValid) return;

    try {
      let success = false;

      if (isEditMode && formDataToSubmit._id) {
        // Update existing death record
        success = await updatedeath(formDataToSubmit._id, formDataToSubmit);
      } else {
        // Add new death record
        success = await adddeath(formDataToSubmit);
      }

      if (success) {
        // Reset the death form but keep profile_id for convenience
        setdeathFormData({
          death_date: '',
          death_reason: '',
          death_place: '',
          prodile_id: id
        });
        setIsShowButton(false);

        // Refresh the death records list
        fetchdeaths();
      } else {
        toast.error("Death operation failed");
      }
    } catch (error) {
      console.error("Error in handleDeathSubmit:", error);
      toast.error("Error adding or updating death record");
    }
  };


  const router = useRouter();

  const GoToBack = async () => {
    try {
      // Validate userId exists
      router.back();

    } catch (error) {
      console.error('Navigation failed:', error);
      // Fallback or error handling
      router.push('/error?type=navigation_failed');
    }
  };


  const getPersonNameById = (id) => {
  const person = persons.find((p) => p.pid === id);
  return person ? `${person.first_name} ${person.last_name}` : '';
};


// 🔁 Map version (faster if you have many rows)
const personNameMap = new Map();
persons.forEach(p => {
  personNameMap.set(p.pid, `${p.first_name} ${p.last_name}`);
});

  return (
    <div className="nk-content-body">
      <div className="nk-block">
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
                <button onClick={() => GoToBack()} className="btn btn-danger ml-1">
                  <span>Cancel</span>
                </button>
               
              </li>
            </ul>
          </div>
        </div>

        {/* Right Content - Tabs */}
        <div style={{ marginTop: "10px" }} className="row">
          <div className="col-md-2">
            <UserCard singlePerson={singlePerson} />
          </div>
          <div className="col-md-10">
            <ul className="nav nav-tabs bg-white rounded-top rounded-bottom">
              <li style={{ marginLeft: "10px" }} className="nav-item">
                <a
                  className={`nav-link text-black ${activeTab === 'person-details' ? 'active' : ''}`}
                  data-bs-toggle="tab"
                  href="#person-details-tab"
                  onClick={() => setActiveTab('person-details')}
                >
                  Basic Info
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link text-black ${activeTab === 'child-detail' ? 'active' : ''}`}
                  data-bs-toggle="tab"
                  href="#child-detail-tab"
                  onClick={() => setActiveTab('child-detail')}
                >
                  Children Detail
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link text-black ${activeTab === 'education-detail' ? 'active' : ''}`}
                  data-bs-toggle="tab"
                  href="#education-detail-tab"
                  onClick={() => setActiveTab('education-detail')}
                >
                  Education Detail
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link text-black ${activeTab === 'death-detail' ? 'active' : ''}`}
                  data-bs-toggle="tab"
                  href="#death-detail-tab"
                  onClick={() => setActiveTab('death-detail')}
                >
                  Death Detail
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link text-black ${activeTab === 'marriage-detail' ? 'active' : ''}`}
                  data-bs-toggle="tab"
                  href="#marriage-detail-tab"
                  onClick={() => setActiveTab('marriage-detail')}
                >
                  Marriage Detail
                </a>
              </li>

            </ul>
            <div className="tab-content">
              {activeTab === "person-details" && (
                <div id="person-details-tab" className="tab-pane fade show active">
                  <div className="card card-bordered card-preview">
                    <div className="card-inner-group">
                      <div className="card">
                        <div className="card-inner">
                          <div className="nk-block-head d-flex justify-content-between align-items-center">
                            <div>
                              <h5 className="title">Personal Information</h5>
                              <p>Basic info, like your name and address.</p>
                            </div>
                            {!editMode ? (
                              <button style={{marginTop:"-4.2rem",marginRight:"-1.5rem"}} className="btn btn-warning" onClick={setRecordInfields}>
                                <span className="icon ni ni-pen"></span>
                              </button>

                            ): <button style={{marginTop:"-4.2rem",marginRight:"-1.5rem"}} className="btn btn-danger" onClick={closeFormModl}>
                                <span className="icon ni ni-cross-c"></span>
                              </button>}
                          </div>

                        <div className="nk-block">
  <div className="nk-data data-list">
    <div className="data-head">
      <h6 className="overline-title">Basics</h6>
    </div>

    {[
      { label: "First Name", key: "first_name" },
      { label: "Last Name", key: "last_name" },
      { label: "CNIC", key: "cnic" },
      { label: "Date of Birth", key: "birth_date" },
      { label: "Mobile Number", key: "contact" },
      { label: "Email Address", key: "email" },
      { label: "Blood Group", key: "blood_group" },
      { label: "Marital Status", key: "marital_status" },
      { label: "Country", key: "birth_place" },
      { label: "Occupation", key: "occupation" },
      { label: "Gender", key: "gender" },
      { label: "Alive", key: "alive" },
      { label: "Father Name", key: "father_id" },
      { label: "Mother Name", key: "mother_id" },
    ]
      // Group into pairs for row layout
      .reduce((rows, field, index, array) => {
        if (index % 2 === 0) rows.push(array.slice(index, index + 2));
        return rows;
      }, [])
      .map((pair, rowIndex) => (
        <div className="row" key={`row-${rowIndex}`}>
          {pair.map(({ label, key }) => (
            <div className="col-md-6" key={key}>
              <div className="data-item">
                <div className="data-col">
                  <span className="data-label">{label}</span>
                  {editMode ? (
                    key === "father_id" || key === "mother_id" ? (
                      <select
                        className="form-control"
                        name={key}
                        value={formData[key] || ""}
                        onChange={handleInputChange}
                      >
                        <option value="">Select {label}</option>
                        {persons?.map((person) => (
                          <option key={person._id} value={person._id}>
                            {person.first_name} {person.last_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        name={key}
                        value={formData[key] || ""}
                        onChange={handleInputChange}
                      />
                    )
                  ) : (
                    <span className="data-value">
                      {key === "father_id" || key === "mother_id"
                        ? getPersonNameById(singlePerson?.[key])
                        : typeof singlePerson?.[key] === "boolean"
                        ? singlePerson[key]
                          ? "Yes"
                          : "No"
                        : singlePerson?.[key] || "—"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

    {editMode && (
      <div className="mt-3">
        <button className="btn btn-primary" onClick={handleSubmit}>
          Update Changes
        </button>
      </div>
    )}
  </div>
</div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>


            {/* child tab detail */}
            {activeTab === 'child-detail' && (
              <div id="child-detail-tab" className="tab-pane fade show active">

                <div className="card card-bordered card-preview">

                  <div className="card-inner-group">

                    <div className="card-inner">
                      <div className="card-title-group">
                        <div className="card-title">
                          <button onClick={openModal}
                            type="button" className="btn btn-primary ml-1">
                            <i className="icon ni ni-plus"></i>
                            <span>Add New</span>
                          </button>


                        </div>
                      </div>
                    </div>
                    <ProfileDataTable
                      openModal={openMngeModal}
                      handlePageChange={handlePageChange}
                      pagination={pagination}
                      data={data}
                      loading={loading}
                      searchQuery={searchQuery}
                      offset={offset}
                      personsPerPage={personsPerPage}
                      handleSearchChange={handleSearchChange}
                      openDeleteModal={openDeleteModal}
                      handleEdit={handleEdit}
                    />


                  </div>
                </div>

              </div>
            )}

            {activeTab === 'education-detail' && (
              <div id="education-detail-tab" className="tab-pane fade show active">
                <div className="card card-bordered card-preview">
                  <div className="card-inner-group">
                    <div style={{paddingBottom:"0.3rem"}} className="card-inner">
                      <div className="card-title-group">
                        <div className="card-title">
                          {/* <h5 className="title">Add Eduction Details</h5> */}
                        </div>
                        <div className="card-tools mr-n1">
                          <ul className="btn-toolbar">
                            <li style={{ marginTop: "-1.3rem", marginRight: "-1.0rem" }}>
                              {showButton == false ? (
                                <button
                                  type="button"
                                  className="btn btn-info btn-md ml-1"
                                  onClick={openFormModalEduction}
                                >
                                  <span className="icon ni ni-plus-medi-fill"></span>
                                </button>
                              ) : null}

                              {showButton == true ? (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-md ml-1"
                                  onClick={closesForm}
                                >
                                  <span className="icon ni ni-cross-c"></span>
                                </button>
                              ) : null}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="card-inner p-0">
                      {showButton == true ? (
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

                              <div className="col-md-5"></div>
                              <div style={{ marginTop: "auto" }} className="col-md-3 text-right pt-2">
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
                      ) : 
                     

                        <DynamicTable
                        title="Education Records"
                        columns={[
                          { key: 'class_name', label: 'Class Name', badgeClass: 'badge-primary' },
                          { key: 'year', label: 'Year', badgeClass: 'badge-primary' },
                          { key: 'institute', label: 'Institute', badgeClass: 'badge-primary' },
                          { key: 'created_on', label: 'Created On', badgeClass: 'badge-warning' },
                          { key: 'updated_on', label: 'Updated On', badgeClass: 'badge-warning' }
                        ]}
                        data={educations}
                        loading={educationLoading}
                        showActions={true}
                        person={persons}
                        onDelete={openEducationDeleteModal}
                        onEdit={modifyButton}
                        emptyMessage="No education records found"
                        customStyles={{
                          tbody: { fontFamily: "Segoe UI" },
                          thead: { fontSize: "14px", fontWeight: 'bold' }
                       }}
                       />
                       }
                    </div>
                  </div>
                </div>
              </div>
            )}


            {activeTab === 'death-detail' && (
              <div id="death-detail-tab" className="tab-pane fade show active">
                <div className="card card-bordered card-preview">
                  <div className="card-inner-group">
                    <div style={{paddingBottom:"0.3rem"}} className="card-inner">
                      <div className="card-title-group">
                        <div className="card-title">
                          {/* <h5 className="title">Add Death Details</h5> */}
                        </div>
                        <div className="card-tools mr-n1">
                          <ul className="btn-toolbar">
                           <li style={{ marginTop: "-1.3rem", marginRight: "-1.0rem" }}>
                              {showButton == false ? (
                                <button
                                  type="button"
                                  className="btn btn-info btn-md ml-1"
                                  onClick={openFormModalEduction}
                                >
                                  <span className="icon ni ni-plus-medi-fill"></span>
                                </button>
                              ) : null}

                              {showButton == true ? (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-md ml-1"
                                  onClick={closeForm}
                                >
                                  <span className="icon ni ni-cross-c"></span>
                                </button>
                              ) : null}
                            </li>
                          </ul>
                        </div>
                        <div className="card-search search-wrap" data-search="search">
                          <div className="search-content">
                            <a href="javascript:void(0)" className="search-back btn btn-icon toggle-search" data-target="search"><em className="icon ni ni-arrow-left"></em></a>
                            {/* <input type="text" ng-model="searchTextRunning" class="form-control form-control-sm border-transparent form-focus-none" placeholder="Search..."> */}
                            <button className="search-submit btn btn-icon"><em className="icon ni ni-search"></em></button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-inner p-0">
                      {showButton==true?(
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
                      ):
                       <DynamicTable
                        title="Death History"
                        columns={[
                          { key: 'death_place', label: 'Death Place', badgeClass: 'badge-primary' },
                          { key: 'death_reason', label: 'Death Reason', badgeClass: 'badge-primary' },
                          { key: 'death_date', label: 'Death Date', type: 'date', badgeClass: 'badge-warning' },
                          { key: 'created_on', label: 'Created On', type: 'date', badgeClass: 'badge-warning' },
                          { key: 'updated_on', label: 'Updated On', type: 'date', badgeClass: 'badge-warning' }
                        ]}
                        data={death}
                        loading={deathLoading}
                        showActions={true}
                        person={persons}
                        onDelete={openDeathDeleteModal}
                        onEdit={modifyDethButton}
                        emptyMessage="No history found"
                        customStyles={{
                          tbody: { fontFamily: "Segoe UI" },
                          thead: { fontSize: "14px", fontWeight: 'bold' }
                       }}
                       />
                      // <DeathDataTable
                      //   openModal={openMngeModal}
                      //   handlePageChange={handlePageChange}
                      //   pagination={pagination}
                      //   currentPersons={currentPersons}
                      //   death={death}
                      //   persons={persons}
                      //   loading={loading}
                      //   searchQuery={searchQuery}
                      //   offset={offset}
                      //   personsPerPage={personsPerPage}
                      //   filteredPersons={filteredPersons}
                      //   handleSearchChange={handleSearchChange}
                      //   handlePageClick={handlePageClick}
                      //   openDeleteModal={openDeathDeleteModal}
                      //   handleEdit={modifyDethButton}
                      // />
            }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* marriage tab detail */}

            {activeTab === 'marriage-detail' && (

              <div id="marriage-detail-tab" className="tab-pane fade show active">
                <div className="card card-bordered card-preview">
                  <div className="card-inner-group">


                    {/* Card Title Group */}
                    <div className="card-inner">
                      <div className="card-title-group">
                        <div className="card-title">
                          <h5 className="title">User Marriage Profile</h5>
                        </div>
                        <div className="card-tools mr-n1">
                          <ul className="btn-toolbar">
                            {marriageMode == false ? (
                              <button className="btn btn-primary ml-2" type="button" onClick={showMarriageWidget}>
                                <span className="icon ni ni-plus-medi-fill"></span>
                              </button>
                            ) : <button className="btn btn-danger ml-2" type="button" onClick={closeMarriageWidget}>
                              <span className="icon ni ni-cross-c"></span>
                            </button>

                            }


                          </ul>
                        </div>
                        
                      </div>
                    </div>

                    {/* Form */}
                    <div className="card-inner p-0">
                      {marriageMode==true?(
                        <form onSubmit={handleReltionshipSubmit}>
                        <div className="modal-body pt-3">
                          {useRelationshipStore.getState().error && (
                            <div className="alert alert-danger">{useRelationshipStore.getState().error}</div>
                          )}
                          <div className="row">
                            <div className="col-md-3">
                              <div className="form-group mt-1">
                                <label className="form-label">Select Person1</label>
                                <div className="form-control-wrap">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div className="form-control form-control-lg">
                                       {RelationshipFormData.person1_id
                                                      ? persons.find(p => p.pid === RelationshipFormData.person1_id)
                                                        ? `${persons.find(p => p.pid === RelationshipFormData.person1_id).first_name} ${persons.find(p => p.pid === RelationshipFormData.person1_id).last_name}`
                                                        : RelationshipFormData.person1_id
                                                      : selectedPersonId1.slice(0, 12)}
                                      
                                    </div>
                                    <button className="btn btn-primary ml-2" type="button" onClick={() => openSerchModal('person1_id')}>
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
                                <label className="form-label">Person 2</label>
                                <div className="form-control-wrap">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div className="form-control form-control-lg">
                                       {singlePerson.pid
                                                      ? persons.find(p => p.pid === singlePerson.pid)
                                                        ? `${persons.find(p => p.pid === singlePerson.pid).first_name} ${persons.find(p => p.pid === singlePerson.pid).last_name}`
                                                        :singlePerson.pid
                                                      : selectedPersonId1.slice(0, 12)}
                                      
                                    </div>
                                    <button className="btn btn-primary ml-2" type="button" onClick={() => openSerchModal('person1_id')}>
                                      Choose
                                    </button>
                                  </div>
                                  {RelationshipFormErrors.person1_id && (
                                    <div className="invalid-feedback">{RelationshipFormErrors.person1_id}</div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="col-md-2">
                              <div className="form-group mt-1">
                                <label className="form-label">Relationship Type</label>
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
                                <label className="form-label"><span>Select Date</span></label>
                                <div className="form-control-wrap">
                                  <DatePicker
                                    selected={RelationshipFormData.date}
                                    onChange={handlesDateChange}
                                    className="form-control form-control-lg"
                                    placeholderText="Select birth date"
                                    dateFormat="yyyy-MM-dd"
                                    maxDate={new Date()}
                                  />
                                </div>
                              </div>
                            </div>
                            <div style={{ marginTop: "1.5rem" }} className="col-md-3 text-right pt-2">
                              <button type="submit" className="btn btn-primary w-50 h-100 justify-center" disabled={RelationshipLoading}>
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

                          {/* Submit Button */}
                          <div className="row mt-2" style={{ borderTop: "1px solid #ede8e8" }}></div>
                        </div>
                      </form>
                      ):   

                       <DynamicTable
                        title="Marriage History"
                        columns={[
                          { 
                            key: 'person1_id', 
                            label: 'Partner Name', 
                            badgeClass: 'badge-primary',
                            format: (value, record) => {
                              const person1Profile = personNameMap.get(value);
                              return person1Profile ? `${person1Profile.first_name} ${person1Profile.last_name}` : 'N/A';
                            }
                          },
                          { key: 'relationship_type', label: 'Relationship Type', badgeClass: 'badge-primary' },
                          { key: 'date', label: 'Date', type: 'date', badgeClass: 'badge-warning' }
                        ]}
                        data={marriageList.length > 0 ? marriageList : marriageRecords}
                        loading={RelationshipLoading}
                        showActions={true}
                        person={persons}
                        onDelete={openDeathDeleteModal}
                        onEdit={handleRelationshipEdit}
                        emptyMessage="No marriage history found"
                        customStyles={{
                          tbody: { fontFamily: "Segoe UI" },
                          thead: { fontSize: "14px", fontWeight: 'bold' }
                       }}
                       />
                      
                      
                      
                    //   <div className="col-md-12">

                    //     <div className="card-inner p-0 table-responsive">
                    //       <table className="table table-hover nowrap align-middle dataTable-init">
                    //         <thead style={{ fontSize: "14px", fontWeight: 'bold' }} className="tb-tnx-head">
                    //           <tr>
                    //             <th scope="col">#</th>
                    //             <th>Partner Name</th>
                    //             <th>Relationship Type</th>
                    //             <th>CreatedBy</th>
                    //             <th>Action</th>
                    //           </tr>
                    //         </thead>
                    //         <tbody style={{ fontFamily: "Segoe UI" }} className="tb-tnx-body">
                    //           {loading ? (
                    //             <tr>
                    //               <td className="text-center">
                    //                 <span className="spinner-border text-secondary" role="status">
                    //                   <span className="visually-hidden">Loading...</span>
                    //                 </span>
                    //               </td>
                    //             </tr>
                    //           ) : (marriageList.length > 0 ? marriageList : marriageRecords).length === 0 ? (
                    //             <tr>
                    //               <td className="text-center">No Records found</td>
                    //             </tr>
                    //           ) : (
                    //             (marriageList.length > 0 ? marriageList : marriageRecords)
                    //               .map((person: any, index) => {
                    //                 if (!person) return null;
                    //                 // Find matching profiles
                    //                 const person1Profile = personNameMap.get(person.person1_id);
                                    
                    //                 console.log("person1", person1Profile);
                    //                 return (
                    //                   <tr key={person.rid}>
                    //                     <td><b>{marriageOffset + index + 1}</b></td>
                    //                     <td>{person1Profile?.first_name + "" + person1Profile?.last_name || "N/A"}</td>
                    //                     <td>{person.relationship_type}</td>
                                       
                    //                     <td><span className="badge badge-info">{person.date}</span></td>
                    //                     <td className="text-center">
                    //                       <button className="btn btn-info ml-2" type="button" onClick={()=>handleRelationshipEdit(person)}>
                    //                         <span className="icon ni ni-pen"></span>
                    //                       </button>
                    //                     </td>
                    //                   </tr>
                    //                 );
                    //               })
                    //           )}
                    //         </tbody>
                    //       </table>


                    //       {/* <Pagination
                    //   page={pagination.page}
                    //   totalPages={pagination.pages}
                    //   onPageChange={handlePageChange}
                    // /> */}
                    //     </div>
                    //   </div>
                    }

                   

                    </div>

                  </div>
                </div>
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
              <div className="card card-bordered card-preview">

                <div className="card-inner-group">


                  <div className="card-inner p-0">
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
                                        src={previewImage || formData.image}
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
                                      : fatherId.slice(0, 12)}
                                  </div>
                                  <button className="btn btn-primary ml-2" type="button" onClick={() => opensSerchModal('father_id')}>
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
                                      : fatherId.slice(0, 12)}
                                  </div>
                                  <button className="btn btn-primary ml-2" type="button" onClick={() => opensSerchModal('mother_id')}>
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

      {isEducationDeleteModalOpen && (
         <DeleteModal
             personToDelete={personToDelete}
          loading={educationLoading}
          setCloseDeleteModal={setEducationCloseDeleteModal}
          handleDelete={handleDeleteEducationDetail}
          />
      )}
      
      {isDeathDeleteModalOpen && (
        <DeleteModal
               personToDelete={personToDelete}
          loading={deathLoading}
          setCloseDeleteModal={setDeathCloseDeleteModal}
          handleDelete={handleDeleteDeathDetail}
          />
    
      )}

      {isDeleteMrrigeModalOpen && (
        <DeleteModal
                personToDelete={mrriageToDelete}
          loading={loading}
          setCloseDeleteModal={setClosesDeleteModal}
          handleDelete={handlesDelete}
          />
      )}

      {isSearchProfileModalOpen && (
        <SearchProfileModal
          currentPersons={filteredProfiles}
          loading={loadings}
          isEditMode={isEditMode}
          searchQuery={handleInputChanges}
          handleSearchChange={handleSearchChanges}
          handlePageClick={handlePageClick}
          offset={offset}
          close={closesSearchModal}
          handleSelectPerson={(person) => handlesSelectPerson(ProfileKey, person)}
          clearList={removeFilterList}
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

  );
}