// @ts-nocheck

import { useState } from "react";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import MDAlert from "components/MDAlert";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Profile() {
  const [profile, setProfile] = useState({
    userId: "USR-001",
    name: "Richard",
    surname: "Davis",
    email: "richard.davis@example.com",
    contactNumber: "071 123 4567",
  });
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(null);

  const updateProfile = (field) => (event) =>
    setProfile((current) => ({ ...current, [field]: event.target.value }));

  const updatePassword = (field) => (event) =>
    setPasswords((current) => ({ ...current, [field]: event.target.value }));

  const saveProfile = (event) => {
    event.preventDefault();

    if (
      !profile.name.trim() ||
      !profile.surname.trim() ||
      !profile.email.trim() ||
      !profile.contactNumber.trim()
    ) {
      setMessage({ color: "error", text: "Complete all profile fields before saving." });
      return;
    }

    if (passwords.newPassword || passwords.confirmPassword) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        setMessage({ color: "error", text: "The new password and confirmation do not match." });
        return;
      }
      if (passwords.newPassword.length < 8) {
        setMessage({ color: "error", text: "The new password must be at least 8 characters." });
        return;
      }
      setPasswords({ newPassword: "", confirmPassword: "" });
    }

    setMessage({ color: "success", text: "Profile details updated successfully." });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Profile
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Manage your account details and password.
          </MDTypography>
        </MDBox>

        {message && (
          <MDBox mb={3}>
            <MDAlert color={message.color} dismissible onClose={() => setMessage(null)}>
              {message.text}
            </MDAlert>
          </MDBox>
        )}

        <Card>
          <MDBox component="form" onSubmit={saveProfile} p={3}>
            <MDTypography variant="h6" mb={3}>
              User Information
            </MDTypography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <MDInput label="User ID" value={profile.userId} fullWidth disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="Name"
                  value={profile.name}
                  onChange={updateProfile("name")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="Surname"
                  value={profile.surname}
                  onChange={updateProfile("surname")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  type="email"
                  label="Email"
                  value={profile.email}
                  onChange={updateProfile("email")}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <MDInput
                  label="Contact Number"
                  value={profile.contactNumber}
                  onChange={updateProfile("contactNumber")}
                  fullWidth
                />
              </Grid>
            </Grid>

            <MDBox mt={4} pt={3} sx={{ borderTop: "1px solid", borderColor: "divider" }}>
              <MDTypography variant="h6" mb={3}>
                Change Password
              </MDTypography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MDInput
                    type="password"
                    label="New Password"
                    value={passwords.newPassword}
                    onChange={updatePassword("newPassword")}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDInput
                    type="password"
                    label="Confirm Password"
                    value={passwords.confirmPassword}
                    onChange={updatePassword("confirmPassword")}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </MDBox>

            <MDBox mt={4} display="flex" justifyContent="flex-end">
              <MDButton type="submit" variant="gradient" color="primary">
                Save changes
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Profile;
