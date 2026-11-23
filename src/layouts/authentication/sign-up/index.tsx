// @ts-nocheck
/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// react-router-dom components
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";
import { RegisterUserDto } from "Dtos";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";
//Authentication User
import { register } from "./register";
function Cover() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegistrationError("");

    if (!name.trim() || !surname.trim() || !contactNumber.trim() || !email.trim()) {
      setRegistrationError("Please complete all registration fields.");
      return;
    }

    if (password.length < 6) {
      setRegistrationError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setRegistrationError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setRegistrationError("Please accept the Terms and Conditions.");
      return;
    }

    const user: RegisterUserDto = {
      Uid: "",
      Email: email.trim(),
      Name: name.trim(),
      Surname: surname.trim(),
      ContactNumber: contactNumber.trim(),
    };

    setIsSubmitting(true);

    try {
      await register(user, password);
      navigate("/authentication/sign-up-confirmation");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create your account.";
      setRegistrationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CoverLayout image={bgImage} hideBranding greenTheme>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="primary"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Create your Skinzone Naturel account
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Name"
                variant="standard"
                value={name}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setName(event.target.value)
                }
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Surname"
                variant="standard"
                value={surname}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setSurname(event.target.value)
                }
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="tel"
                label="Contact Number"
                variant="standard"
                value={contactNumber}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setContactNumber(event.target.value)
                }
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                variant="standard"
                value={email}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(event.target.value)
                }
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                variant="standard"
                value={password}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(event.target.value)
                }
                fullWidth
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Confirm Password"
                variant="standard"
                value={confirmPassword}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(event.target.value)
                }
                fullWidth
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox
                checked={acceptedTerms}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setAcceptedTerms(event.target.checked)
                }
              />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;I agree the&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="primary"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            {registrationError && (
              <MDTypography variant="caption" color="error" mt={2} display="block">
                {registrationError}
              </MDTypography>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton
                type="submit"
                variant="gradient"
                color="primary"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? "signing up..." : "sign up"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="primary"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
            <MDTypography display="block" variant="caption" color="text" textAlign="center" mt={2}>
              Copyright Skinzone Naturel. Developed by StackedTech PTY (LTD)
            </MDTypography>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;
