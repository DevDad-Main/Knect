import toast from "react-hot-toast";

async function updateWithFormData(
  path,
  formData,
  credential = {},
  methodType = "POST",
) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASEURL}/${path}`, {
      method: methodType,
      body: formData,
      ...credential,
    });
    const data = await response.json();
    if (data.success) {
      toast.success(`${data.message}`);
      return data.data;
    } else {
      if (data.errors && Array.isArray(data.errors)) {
        // loop through all validation errors
        data.errors.forEach((err) => {
          toast.error(err.msg);
        });
      } else {
        toast.error(`${data.message || "Something went wrong"}`);
      }
      return null; // so frontend knows request failed
    }
  } catch (error) {
    // alert(error);
    return null;
  }
}

async function fetchData(path, header = {}) {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASEURL}/${path}`, {
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/${path}`, {
      method: "GET",
      credentials: "include",
      headers: header,
    });
    const data = await res.json();
    if (data.success) {
      return data.data;
    } else {
      toast.error(`${data.message}`);
      return null;
    }
  } catch (error) {
    // toast.error(`Please try again in a moment..`);
    toast.error(error.message);
  }
}

async function updateData(path, content, methodType = "POST") {
  try {
    const response = await fetch(`${import.meta.env.VITE_BASEURL}/${path}`, {
      method: methodType,
      body: JSON.stringify(content),
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      credentials: "include",
    });
    const data = await response.json();
    if (data.success) {
      toast.success(`${data.message}`);
      return data.data;
    } else {
      if (data.errors && Array.isArray(data.errors)) {
        // loop through all validation errors
        data.errors.forEach((err) => {
          toast.error(err.msg);
        });
      } else {
        toast.error(`${data.message || "Something went wrong"}`);
      }
      return null; // so frontend knows request failed
    }
  } catch (error) {
    // toast.error(`Please try again in a moment..`);
    toast.error(error.message);
  }
}

export { fetchData, updateData, updateWithFormData };
