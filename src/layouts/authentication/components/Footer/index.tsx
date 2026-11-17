// @ts-nocheck
import PropTypes from "prop-types";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import typography from "assets/theme/base/typography";

function Footer({ light, hideBranding }) {
  const { size } = typography;
  const textColor = light ? "white" : "dark";

  return (
    <MDBox position="absolute" width="100%" bottom={0} py={4}>
      <Container>
        {hideBranding ? (
          <MDBox display="flex" justifyContent="center" alignItems="center" width="100%">
            <MDTypography variant="button" fontWeight="medium" color={textColor}>
              Copyright Skinzone Naturel. Developed by StackedTech PTY (LTD)
            </MDTypography>
          </MDBox>
        ) : (
          <MDBox
            width="100%"
            display="flex"
            flexDirection={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems="center"
            px={1.5}
          >
            <MDBox
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexWrap="wrap"
              color={light ? "white" : "text"}
              fontSize={size.sm}
            >
              &copy; {new Date().getFullYear()}, made with
              <MDBox fontSize={size.md} color={textColor} mb={-0.5} mx={0.25}>
                <Icon color="inherit" fontSize="inherit">
                  favorite
                </Icon>
              </MDBox>
              by
              <Link href="https://www.creative-tim.com/" target="_blank">
                <MDTypography variant="button" fontWeight="medium" color={textColor}>
                  &nbsp;Creative Tim&nbsp;
                </MDTypography>
              </Link>
              for a better web.
            </MDBox>
            <MDBox
              component="ul"
              sx={({ breakpoints }) => ({
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                listStyle: "none",
                mt: 3,
                mb: 0,
                p: 0,
                [breakpoints.up("lg")]: { mt: 0 },
              })}
            >
              <MDBox component="li" pr={2} lineHeight={1}>
                <Link href="https://www.creative-tim.com/" target="_blank">
                  <MDTypography variant="button" fontWeight="regular" color={textColor}>
                    Creative Tim
                  </MDTypography>
                </Link>
              </MDBox>
              <MDBox component="li" px={2} lineHeight={1}>
                <Link href="https://www.creative-tim.com/presentation" target="_blank">
                  <MDTypography variant="button" fontWeight="regular" color={textColor}>
                    About Us
                  </MDTypography>
                </Link>
              </MDBox>
              <MDBox component="li" px={2} lineHeight={1}>
                <Link href="https://www.creative-tim.com/blog" target="_blank">
                  <MDTypography variant="button" fontWeight="regular" color={textColor}>
                    Blog
                  </MDTypography>
                </Link>
              </MDBox>
              <MDBox component="li" pl={2} lineHeight={1}>
                <Link href="https://www.creative-tim.com/license" target="_blank">
                  <MDTypography variant="button" fontWeight="regular" color={textColor}>
                    License
                  </MDTypography>
                </Link>
              </MDBox>
            </MDBox>
          </MDBox>
        )}
      </Container>
    </MDBox>
  );
}

Footer.defaultProps = {
  light: false,
  hideBranding: false,
};

Footer.propTypes = {
  light: PropTypes.bool,
  hideBranding: PropTypes.bool,
};

export default Footer;
