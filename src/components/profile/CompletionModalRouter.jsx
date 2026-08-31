import { useNavigate } from "react-router-dom";

export function useCompletionRouter({ onOpenEditProfile }) {
  const navigate = useNavigate();

  const handleRouteAction = (section) => {
    const action = section?.targetAction || section?.id;

    switch (action) {
      case "edit_profile":
      case "basic_info":
      case "avatar_photo":
      case "upload_avatar":
        if (onOpenEditProfile) {
          onOpenEditProfile();
        } else {
          navigate("/app/settings");
        }
        break;

      case "verify_email":
      case "verify_mobile":
      case "email_verification":
      case "mobile_verification":
        navigate("/kyc");
        break;

      case "kyc_identity":
      case "identity_kyc":
        navigate("/kyc");
        break;

      case "kyc_company":
      case "founder_company":
        navigate("/kyc");
        break;

      case "kyc_investor":
      case "investor_kyc":
        navigate("/kyc");
        break;

      default:
        navigate("/kyc");
        break;
    }
  };

  return { handleRouteAction };
}

export default useCompletionRouter;
