// @ts-nocheck

import { Link } from "react-router-dom";

import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

import CoverLayout from "layouts/authentication/components/CoverLayout";

import bgImage from "assets/images/bg-sign-up-cover.jpeg";

function SignUpConfirmation() {
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
            Account created
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={4} px={3} textAlign="center">
          <MDTypography variant="body1" color="text" mb={2}>
            Your account has been created. You will receive an email once your account has been
            approved by an administrator.
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Please wait for admin approval before signing in.
          </MDTypography>
          <MDBox mt={4}>
            <MDButton
              component={Link}
              to="/authentication/sign-in"
              variant="gradient"
              color="primary"
              fullWidth
            >
              go to sign in
            </MDButton>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default SignUpConfirmation;
