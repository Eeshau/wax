// import React from "react";

// export function Button({
//   children,
//   ...buttonProps
// }: React.ComponentPropsWithoutRef<"button">) {
//   return (
//     <div className="button">
//       <button {...buttonProps}>
//         {children}
//         {buttonProps.endIcon ? buttonProps.endIcon : null}
//         {buttonProps?.loading ? <div className="loader" /> : null}
//       </button>
//     </div>
//   );
// }


import React, { ReactNode } from "react";
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress, useTheme } from "@mui/material";

type ButtonProps = {
  endIcon?: ReactNode;
  loading?: boolean;
} & MuiButtonProps;

export function Button({ children, endIcon, loading, ...buttonProps }: ButtonProps) {
  const theme = useTheme();

  return (
    <MuiButton 
      sx={{
        borderColor: '#94969C', 
        borderWidth: '1px', 
        borderRadius: '26px',
        paddingX: '26px',
        paddingY: '13px',
        borderStyle: 'solid', 
        backgroundColor: 'rgba(255, 255, 255, 0.87)',
        textTransform: 'none',
        color: theme.palette.primary.main, // Set text color
        ':hover': {
          backgroundColor: '#E0F6FF', // Background color on hover
        },
        ':focus': {
          outline: 'none', // Remove outline on focus
        },
        ':active': {
          outline: 'none', // Remove outline on active
        },
      }}
      {...buttonProps}
      endIcon={loading ? <CircularProgress size={24} /> : endIcon}
      disabled={loading || buttonProps.disabled}
    >
      {children}
    </MuiButton>
  );
}
