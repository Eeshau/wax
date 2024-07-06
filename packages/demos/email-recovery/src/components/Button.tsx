// import React, { ReactNode } from "react";

// type ButtonProps = {
//   endIcon?: ReactNode;
//   loading?: boolean;
// } & React.ComponentPropsWithoutRef<"button">;

// export function Button({ children, ...buttonProps }: ButtonProps) {
//   return (
//     <div className="button">
//       <button {...buttonProps}>
//         {children}
//         {buttonProps?.endIcon ? buttonProps?.endIcon : null}
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
      borderColor: '#000000', 
      borderWidth: '1px', 
      borderStyle: 'solid', 
      backgroundColor: '#rgba(255, 255, 255, 0.87)',
      textTransform: 'none',
      color: theme.palette.primary.main, // Set text color
      ':hover': {
        backgroundColor: '#E0F6FF', // Make sure the background color remains transparent on hover
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
