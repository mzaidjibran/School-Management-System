import { useState, useRef, useEffect } from "react";
import createStudent from "../../Api/Student_Api";
import { getAllClasses } from "../../Api/Class_Api";
import toast from "react-hot-toast";

// ---------- Floating Label Input ----------
const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  className = "",
  placeholder,
}) => {
  const isDate = type === "date";
  const hasValue = !!value;

  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder || " "}
        style={isDate && !hasValue ? { color: "transparent" } : {}}
        onFocus={(e) => {
          if (isDate) e.target.style.color = "inherit";
        }}
        onBlur={(e) => {
          if (isDate && !value) e.target.style.color = "transparent";
        }}
        className={`peer w-full px-4 pt-5 pb-2 border rounded-md bg-white
          text-slate-800 outline-none transition-all text-sm
          ${error ? "border-red-400 focus:ring-red-100" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"}
          focus:ring-2 disabled:bg-slate-50 disabled:cursor-not-allowed`}
      />
      <label
        htmlFor={name}
        className={`absolute left-4 transition-all duration-200 pointer-events-none
          ${value ? "top-1.5 text-[10px] text-indigo-600" : "top-3.5 text-sm text-slate-400"}
          peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-indigo-600`}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// ---------- Floating Label Select ----------
const Select = ({
  label,
  name,
  options = [],
  value,
  onChange,
  required = false,
  error,
  className = "",
}) => (
  <div className={`relative ${className}`}>
    <select
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      className={`peer w-full px-4 pt-5 pb-2 border rounded-md bg-white
        text-slate-800 outline-none transition-all appearance-none text-sm
        ${error ? "border-red-400 focus:ring-red-100" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"}
        focus:ring-2`}
    >
      <option value=""></option>
      {options.map((o) => {
        const val = typeof o === "object" ? o.value : o;
        const lbl = typeof o === "object" ? o.label : o;
        return (
          <option key={val} value={val}>
            {lbl}
          </option>
        );
      })}
    </select>
    <label
      htmlFor={name}
      className={`absolute left-4 transition-all duration-200 pointer-events-none
        ${value ? "top-1.5 text-[10px] text-indigo-600" : "top-3.5 text-sm text-slate-400"}
        peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-indigo-600`}
    >
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <svg
      className="absolute right-3 top-4 w-4 h-4 text-slate-400 pointer-events-none"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// ---------- Section Title ----------
const SectionTitle = ({ title }) => (
  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
    <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
    {title}
  </h3>
);

// ---------- Main AddStudent ----------
export default function AddStudent() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const emptyForm = {
    fullName: "",
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    cnic: "",
    religion: "",
    nationality: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    fatherName: "",
    motherName: "",
    parentPhone: "",
    class: "",
    rollNumber: "",
    section: "",
    schoolSection: localStorage.getItem("activeSection") || "girls",
    admissionDate: "",
    previousSchool: "",
    medicalInfo: "",
    emergencyName: "",
    emergencyPhone: "",
    biometricId: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [apiError, setApiError] = useState("");
  const [classesList, setClassesList] = useState([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await getAllClasses();
        setClassesList(res.data || []);
      } catch (err) {
        console.error("Failed to load classes:", err);
      }
    };
    fetchClasses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateImage = (file) => {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setImageError("Only JPG or PNG files are allowed.");
      return false;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image size must be less than 2MB.");
      return false;
    }
    return true;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
      setImageError("");
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && validateImage(file)) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
      setImageError("");
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    } else if (currentStep === 2) {
      if (!formData.class) newErrors.class = "Class is required";
      if (!formData.rollNumber) newErrors.rollNumber = "Roll number is required";
      if (!formData.admissionDate) newErrors.admissionDate = "Admission date is required";
      if (!formData.schoolSection) newErrors.schoolSection = "School section is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep() && currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsSaving(true);
    setApiError("");

    try {
      const fd = new FormData();

      // Name split
      const nameParts = formData.fullName.trim().split(/\s+/);
      fd.append("firstName", nameParts[0] || "");
      fd.append("lastName", nameParts.slice(1).join(" ") || nameParts[0] || "");

      // Gender lowercase (backend enum: male/female/other)
      fd.append("gender", formData.gender.toLowerCase());

      fd.append("dateOfBirth", formData.dateOfBirth);
      fd.append("email", formData.email);
      fd.append("phone", formData.phone);
      fd.append("address", formData.address);
      fd.append("city", formData.city);

      // Guardian
      fd.append("guardian[name]", formData.fatherName || formData.motherName || "");
      fd.append("guardian[phone]", formData.parentPhone || "");
      fd.append(
        "guardian[relationship]",
        formData.fatherName ? "father" : "mother"
      );

      // Academic
      fd.append("rollNumber", formData.rollNumber);
      fd.append("section", formData.section);
      fd.append("schoolSection", formData.schoolSection);
      fd.append("admissionDate", formData.admissionDate);
      fd.append("class", formData.class);

      // Optional
      if (formData.cnic)           fd.append("CNIC", formData.cnic);
      if (formData.bloodGroup)     fd.append("bloodGroup", formData.bloodGroup);
      if (formData.religion)       fd.append("religion", formData.religion);
      if (formData.nationality)    fd.append("nationality", formData.nationality);
      if (formData.previousSchool) fd.append("previousSchool", formData.previousSchool);
      if (formData.medicalInfo)    fd.append("medicalInfo", formData.medicalInfo);
      if (formData.emergencyName)  fd.append("emergencyName", formData.emergencyName);
      if (formData.emergencyPhone) fd.append("emergencyPhone", formData.emergencyPhone);
      if (formData.biometricId)    fd.append("biometricId", formData.biometricId);

      // Image
      if (profileImage) fd.append("profileImage", profileImage);

      await createStudent(fd);

      toast.success("Student saved successfully!");

      if (addAnother) {
        setFormData(emptyForm);
        setProfileImage(null);
        setImagePreview(null);
        setErrors({});
        setCurrentStep(1);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.message || "Kuch ghalat hua, dobara koshish karein");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setProfileImage(null);
    setImagePreview(null);
    setErrors({});
    setSaveSuccess(false);
    setApiError("");
  };

  const completionPercentage = () => {
    const fields = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      class: formData.class,
      rollNumber: formData.rollNumber,
    };
    return Math.round(
      (Object.values(fields).filter(Boolean).length / Object.keys(fields).length) * 100
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <nav className="text-sm text-slate-500 mb-2">
            <span className="hover:text-indigo-600 cursor-pointer">Dashboard</span> /{" "}
            <span className="hover:text-indigo-600 cursor-pointer">Students</span> /{" "}
            <span className="text-indigo-600">Add Student</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-md">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Add New Student</h1>
              <p className="text-slate-500 text-sm">Fill in the details to create a student profile</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8 bg-white/60 backdrop-blur-sm rounded-md p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentStep >= step ? "bg-indigo-600 w-16" : "bg-slate-200 w-8"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm font-medium text-indigo-600">
              {completionPercentage()}% completed
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Personal & Contact</span>
            <span>Academic</span>
            <span>Additional</span>
          </div>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="bg-white rounded-md shadow-sm border border-slate-100">
            {/* Profile Image */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-blue-50/50">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-200 ring-4 ring-white shadow-lg">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition shadow-sm">
                      Upload Photo
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                        ref={fileInputRef}
                      />
                    </label>
                    <div
                      onDrop={handleImageDrop}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-slate-300 rounded-md px-4 py-2 text-sm text-slate-500 hover:border-indigo-500 transition cursor-pointer"
                    >
                      Drag & Drop
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="border border-slate-300 rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                  {imageError && <p className="text-red-500 text-xs mt-2">{imageError}</p>}
                  <p className="text-xs text-slate-400 mt-2">JPG or PNG, max 2MB</p>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6 space-y-8">
              {/* Step 1 */}
              {currentStep === 1 && (
                <>
                  <div>
                    <SectionTitle title="Personal Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} required error={errors.fullName} />
                      <Select label="Gender" name="gender" options={["Male", "Female", "Other"]} value={formData.gender} onChange={handleInputChange} required error={errors.gender} />
                      <Input label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required error={errors.dateOfBirth} />
                      <Select label="Blood Group" name="bloodGroup" options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} value={formData.bloodGroup} onChange={handleInputChange} />
                      <Input label="CNIC (optional)" name="cnic" value={formData.cnic} onChange={handleInputChange} />
                      <Input label="Religion" name="religion" value={formData.religion} onChange={handleInputChange} />
                      <Input label="Nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div>
                    <SectionTitle title="Contact Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required error={errors.phone} />
                      <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} required error={errors.email} />
                      <Input label="Address" name="address" value={formData.address} onChange={handleInputChange} />
                      <Input label="City" name="city" value={formData.city} onChange={handleInputChange} />
                      <Input label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleInputChange} />
                      <Input label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleInputChange} />
                      <Input label="Parent/Guardian Phone" type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleInputChange} />
                    </div>
                  </div>
                </>
              )}

              {/* Step 2 */}
              {currentStep === 2 && (
                <div>
                  <SectionTitle title="Academic Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Select
                      label="Class"
                      name="class"
                      options={classesList.map((c) => ({ value: c._id, label: `${c.name} (${c.section})` }))}
                      value={formData.class}
                      onChange={handleInputChange}
                      required
                      error={errors.class}
                    />
                    <Input label="Roll Number" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} required error={errors.rollNumber} />
                    <Input label="Biometric Machine ID (Enroll No)" name="biometricId" value={formData.biometricId} onChange={handleInputChange} />
                    <Input label="Class Section (e.g. A, B)" name="section" value={formData.section} onChange={handleInputChange} />
                    <Select
                      label="School Section"
                      name="schoolSection"
                      options={[
                        { value: "girls", label: "Girls Section" },
                        { value: "boys", label: "Boys Section" },
                      ]}
                      value={formData.schoolSection}
                      onChange={handleInputChange}
                      required
                      error={errors.schoolSection}
                    />
                    <Input label="Admission Date" type="date" name="admissionDate" value={formData.admissionDate} onChange={handleInputChange} required error={errors.admissionDate} />
                    <Input label="Previous School" name="previousSchool" value={formData.previousSchool} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {currentStep === 3 && (
                <div>
                  <SectionTitle title="Additional Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1.5">
                        Medical Information / Allergies
                      </label>
                      <textarea
                        name="medicalInfo"
                        value={formData.medicalInfo}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Any medical conditions or allergies..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-md text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      />
                    </div>
                    <Input label="Emergency Contact Name" name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} />
                    <Input label="Emergency Contact Number" type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between gap-3 rounded-b-2xl">
              <div className="flex flex-wrap gap-3">
                {currentStep > 1 && (
                  <button type="button" onClick={prevStep} className="px-6 py-2 text-sm border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 transition">
                    Back
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button type="button" onClick={nextStep} className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition shadow-sm">
                    Next Step
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition shadow-sm disabled:opacity-60 flex items-center gap-2"
                    >
                      {isSaving && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      )}
                      {isSaving ? "Saving..." : "Save Student"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, true)}
                      disabled={isSaving}
                      className="px-6 py-2 text-sm border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition disabled:opacity-60"
                    >
                      Save & Add Another
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 text-sm border border-slate-300 rounded-md text-slate-600 hover:bg-slate-100 transition"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 text-sm text-slate-500 hover:text-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-4 py-3 rounded-md shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Student saved successfully!
          </div>
        )}
      </div>
    </div>
  );
}