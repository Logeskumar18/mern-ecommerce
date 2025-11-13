import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      try {
        const resUser = await fetch(`/api/auth/profile/${user._id}`);
        const dataUser = await resUser.json();

        const resOrders = await fetch(`/api/orders/user/${user._id}`);
        const dataOrders = await resOrders.json();

        if (resUser.ok) {
          setProfile(dataUser);
          setForm({
            name: dataUser.name,
            phone: dataUser.phone || "",
            address: dataUser.address || "",
          });
        }

        if (resOrders.ok) setOrders(dataOrders);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/auth/profile/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setProfile(data);
        setMessage("Profile updated successfully ✅");
        setEditMode(false);
      } else {
        setMessage("Failed to update profile ❌");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong ❌");
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center text-secondary" style={{ minHeight: "100vh" }}>
        Loading profile...
      </div>
    );

  if (!profile)
    return (
      <div className="d-flex justify-content-center align-items-center text-danger fw-semibold" style={{ minHeight: "100vh" }}>
        Profile not found
      </div>
    );

  return (
    <div className="bg-light py-5 px-3" style={{ minHeight: "100vh" }}>
      <div className="container">
        <div className="bg-white shadow rounded-3 p-4 p-md-5">
          <h2 className="h3 fw-bold mb-4 mb-md-5 text-center text-dark">My Profile</h2>

          {message && (
            <div className="mb-3 text-center text-success small fw-medium">
              {message}
            </div>
          )}

          {/* Profile Info */}
          <div className="border-bottom pb-4 mb-4">
            {editMode ? (
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                  />
                </div>
                <div className="col-12 d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleUpdate}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-1">
                  <span className="fw-semibold">Name:</span> {profile.name}
                </p>
                <p className="mb-1">
                  <span className="fw-semibold">Email:</span> {profile.email}
                </p>
                <p className="mb-1">
                  <span className="fw-semibold">Phone:</span> {profile.phone || "Not set"}
                </p>
                <p className="mb-1">
                  <span className="fw-semibold">Address:</span> {profile.address || "Not set"}
                </p>
                <button
                  className="btn btn-primary mt-3"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Order History */}
          <div>
            <h3 className="h5 fw-semibold text-dark mb-3">My Orders</h3>
            {orders.length === 0 ? (
              <p className="text-secondary small">No orders yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="d-flex justify-content-between align-items-center border rounded p-3 bg-light"
                  >
                    <div>
                      <p className="mb-1 fw-medium text-dark">Order ID: {order._id}</p>
                      <p className="mb-1 small text-secondary">
                        Date: {new Date(order.createdAt).toLocaleDateString("en-IN")}
                      </p>
                      <p className="mb-0 small text-secondary">
                        Status:{" "}
                        <span className={order.status === "Delivered" ? "text-success" : "text-warning"}>
                          {order.status}
                        </span>
                      </p>
                    </div>
                    <p className="mb-0 fw-semibold text-primary">₹{order.totalAmount}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
