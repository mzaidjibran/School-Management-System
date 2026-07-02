import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import createTeacher from "../../api/Teacher_Api.js";
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
        className={`peer w-full px-4 pt-5 pb-2 border rounded-xl bg-white
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
      className={`peer w-full px-4 pt-5 pb-2 border rounded-xl bg-white
        text-slate-800 outline-none transition-all appearance-none text-sm
        ${error ? "border-red-400 focus:ring-red-100" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"}
        focus:ring-2`}
    >
      <option value=""></option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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

// ---------- Main AddTeacherPage ----------
export default function AddTeacherPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const emptyForm = {
    fullName: "",
    gender: "",
    dateOfBirth: "",
    cnic: "",
    bloodGroup: "",
    maritalStatus: "",
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",
    city: "",
    subject: "",
    qualification: "",
    specialization: "",
    university: "",
    passingYear: "",
    employeeId: "",
    joiningDate: "",
    experience: "",
    salary: "",
    employmentStatus: "",
    schoolSection: localStorage.getItem("activeSection") || "girls",
    notes: "",
    emergencyName: "",
    emergencyPhone: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const navigate = useNavigate();

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
      if (!formData.subject.trim()) newErrors.subject = "Subject is required";
      if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required";
    } else if (currentStep === 3) {
      if (!formData.employeeId.trim()) newErrors.employeeId = "Employee ID is required";
      if (!formData.joiningDate) newErrors.joiningDate = "Joining date is required";
      if (!formData.employmentStatus) newErrors.employmentStatus = "Employment status is required";
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
    setSubmitError("");
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) payload.append(key, value);
      });
      if (profileImage) payload.append("profileImage", profileImage);

      await createTeacher(payload);

      toast.success("Teacher saved successfully!");

      if (addAnother) {
        setFormData(emptyForm);
        setProfileImage(null);
        setImagePreview(null);
        setErrors({});
        setCurrentStep(1);
      } else {
        navigate("/teachers");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setProfileImage(null);
    setImagePreview(null);
    setErrors({});
    setSubmitError("");
    setSaveSuccess(false);
    setCurrentStep(1);
  };

  const completionPercentage = () => {
    const fields = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      subject: formData.subject,
      qualification: formData.qualification,
      employeeId: formData.employeeId,
      joiningDate: formData.joiningDate,
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
            <span className="hover:text-indigo-600 cursor-pointer">Dashboard</span>{" "}
            /{" "}
            <span className="hover:text-indigo-600 cursor-pointer">Teachers</span>{" "}
            /{" "}
            <span className="text-indigo-600">Add Teacher</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Add New Teacher</h1>
              <p className="text-slate-500 text-sm">Fill in the details to create a teacher profile</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
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
            <span>Employment</span>
          </div>
        </div>

        {/* API Error */}
        {submitError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center justify-between">
            <span>{submitError}</span>
            <button onClick={() => setSubmitError("")} className="text-red-400 hover:text-red-600 ml-3 flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">

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
                    <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm">
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
                      className="border-2 border-dashed border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-500 hover:border-indigo-500 transition cursor-pointer"
                    >
                      Drag & Drop
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition"
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

              {/* Step 1 — Personal & Contact */}
              {currentStep === 1 && (
                <>
                  <div>
                    <SectionTitle title="Personal Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} required error={errors.fullName} />
                      <Select label="Gender" name="gender" options={["Male", "Female", "Other"]} value={formData.gender} onChange={handleInputChange} required error={errors.gender} />
                      <Input label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required error={errors.dateOfBirth} />
                      <Input label="CNIC" name="cnic" value={formData.cnic} onChange={handleInputChange} />
                      <Select label="Blood Group" name="bloodGroup" options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} value={formData.bloodGroup} onChange={handleInputChange} />
                      <Select label="Marital Status" name="maritalStatus" options={["Single", "Married", "Divorced", "Widowed"]} value={formData.maritalStatus} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div>
                    <SectionTitle title="Contact Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required error={errors.phone} />
                      <Input label="Alternate Phone" type="tel" name="alternatePhone" value={formData.alternatePhone} onChange={handleInputChange} />
                      <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} required error={errors.email} />
                      <Input label="Address" name="address" value={formData.address} onChange={handleInputChange} />
                      <Input label="City" name="city" value={formData.city} onChange={handleInputChange} />
                    </div>
                  </div>
                </>
              )}

              {/* Step 2 — Academic */}
              {currentStep === 2 && (
                <div>
                  <SectionTitle title="Academic Information" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input label="Subject" name="subject" value={formData.subject} onChange={handleInputChange} required error={errors.subject} />
                    <Input label="Qualification" name="qualification" value={formData.qualification} onChange={handleInputChange} required error={errors.qualification} />
                    <Input label="Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} />
                    <Input label="University" name="university" value={formData.university} onChange={handleInputChange} />
                    <Input label="Passing Year" type="number" name="passingYear" value={formData.passingYear} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              {/* Step 3 — Employment & Additional */}
              {currentStep === 3 && (
                <>
                  <div>
                    <SectionTitle title="Employment Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input label="Employee ID" name="employeeId" value={formData.employeeId} onChange={handleInputChange} required error={errors.employeeId} />
                      <Input label="Joining Date" type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} required error={errors.joiningDate} />
                      <Input label="Experience (years)" type="number" name="experience" value={formData.experience} onChange={handleInputChange} />
                      <Input label="Salary" type="number" name="salary" value={formData.salary} onChange={handleInputChange} />
                      <Select
                        label="Employment Status"
                        name="employmentStatus"
                        options={["Permanent", "Contract", "Probation", "Part-time"]}
                        value={formData.employmentStatus}
                        onChange={handleInputChange}
                        required
                        error={errors.employmentStatus}
                      />
                      <Select
                        label="School Section"
                        name="schoolSection"
                        options={[{ value: "girls", label: "Girls Section" }, { value: "boys", label: "Boys Section" }]}
                        value={formData.schoolSection}
                        onChange={handleInputChange}
                        required
                        error={errors.schoolSection}
                      />
                    </div>
                  </div>
                  <div>
                    <SectionTitle title="Additional Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1.5">Notes</label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Any additional notes..."
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        />
                      </div>
                      <Input label="Emergency Contact Name" name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} />
                      <Input label="Emergency Contact Number" type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between gap-3 rounded-b-2xl">
              <div className="flex flex-wrap gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 text-sm border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 transition"
                  >
                    Back
                  </button>
                )}
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm"
                  >
                    Next Step
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-sm disabled:opacity-60 flex items-center gap-2"
                    >
                      {isSaving && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      )}
                      {isSaving ? "Saving..." : "Save Teacher"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, true)}
                      disabled={isSaving}
                      className="px-6 py-2 text-sm border border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition disabled:opacity-60"
                    >
                      Save & Add Another
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 text-sm border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 transition"
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
          <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Teacher saved successfully!
          </div>
        )}
      </div>
    </div>
  );
}