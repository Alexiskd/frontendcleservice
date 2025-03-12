// Loginside.jsx
import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  InputAdornment,
  IconButton,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Loginside = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [step, setStep] = useState("login"); // 'login', 'requestReset', 'validateCode', 'resetPassword'
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Vérifie si l'utilisateur est déjà connecté lors du montage du composant
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Vous pouvez ajouter une vérification supplémentaire du token ici (par exemple, décodage JWT)
      navigate("/app/admin");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (step === "login") {
      setCredentials((prevCreds) => ({
        ...prevCreds,
        [name]: value,
      }));
      // Efface les erreurs spécifiques lorsque l'utilisateur commence à taper
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
        general: "",
      }));
    } else if (step === "requestReset") {
      setResetEmail(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: "",
      }));
    } else if (step === "validateCode") {
      setResetCode(value);
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: "",
      }));
    } else if (step === "resetPassword") {
      setNewPassword((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrors((prevErrors) => ({
        ...prevErrors,
        general: "",
      }));
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async () => {
    const { email, password } = credentials;
    let hasError = false;
    const newErrors = { email: "", password: "", general: "" };

    // Validation côté client
    if (!email) {
      newErrors.email = "Veuillez entrer votre adresse email.";
      hasError = true;
    }
    if (!password) {
      newErrors.password = "Veuillez entrer votre mot de passe.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({ email: "", password: "", general: "" });

    try {
      const response = await fetch("https://cl-back.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        // Supposons que le backend retourne un champ 'errorCode'
        // 'USER_NOT_FOUND' ou 'INVALID_PASSWORD'
        switch (data.errorCode) {
          case "USER_NOT_FOUND":
            newErrors.email = "Aucun compte trouvé avec cet email.";
            break;
          case "INVALID_PASSWORD":
            newErrors.password = "Mot de passe incorrect.";
            break;
          default:
            newErrors.general = data.message || "Identifiants invalides.";
        }
        setErrors(newErrors);
        throw new Error(data.message || "Identifiants invalides");
      }

      // Si la connexion est réussie
      localStorage.setItem("token", data.accessToken);
      // Vous pouvez stocker d'autres informations si nécessaire
      setMessage("Connexion réussie !");
      // Rediriger vers /app/admin après une courte pause
      setTimeout(() => {
        navigate("/app/admin");
      }, 1000);
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!resetEmail) {
      setErrors({ ...errors, general: "Veuillez entrer votre adresse email." });
      return;
    }

    setLoading(true);
    setErrors({ email: "", password: "", general: "" });

    try {
      const response = await fetch(
        "https://cl-back.onrender.com/users/reset-password-request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la demande de réinitialisation."
        );
      }

      setMessage("Un code de réinitialisation a été envoyé à votre email.");
      setStep("validateCode");
    } catch (error) {
      setErrors({ ...errors, general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCode = () => {
    if (!resetCode) {
      setErrors({ ...errors, general: "Veuillez entrer le code de réinitialisation." });
      return;
    }

    setStep("resetPassword");
    setErrors({ ...errors, general: "" });
  };

  const handleResetPassword = async () => {
    if (!newPassword.password || !newPassword.confirmPassword) {
      setErrors({ ...errors, general: "Veuillez remplir tous les champs." });
      return;
    }

    if (newPassword.password !== newPassword.confirmPassword) {
      setErrors({ ...errors, general: "Les mots de passe ne correspondent pas." });
      return;
    }

    setLoading(true);
    setErrors({ email: "", password: "", general: "" });

    try {
      const response = await fetch("https://cl-back.onrender.com/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetCode,
          newPassword: newPassword.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors de la réinitialisation du mot de passe."
        );
      }

      setMessage("Mot de passe réinitialisé avec succès.");
      setStep("login");
    } catch (error) {
      setErrors({ ...errors, general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (step) {
      case "login":
        return (
          <>
            <TextField
              label="Adresse Email"
              name="email"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={credentials.email}
              onChange={handleChange}
              autoFocus
              error={Boolean(errors.email)}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Mot de Passe"
              name="password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              required
              value={credentials.password}
              onChange={handleChange}
              error={Boolean(errors.password)}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer", textAlign: "right" }}
              onClick={() => {
                setStep("requestReset");
                setErrors({ email: "", password: "", general: "" });
                setMessage("");
              }}
            >
              Mot de passe oublié ?
            </Typography>

            {errors.general && (
              <Alert severity="error" onClose={() => setErrors({ ...errors, general: "" })}>
                {errors.general}
              </Alert>
            )}
            {message && (
              <Alert severity="success" onClose={() => setMessage("")}>
                {message}
              </Alert>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              disabled={loading}
              fullWidth
              sx={{
                mt: 2,
                padding: "12px",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
                backgroundColor: "#333",
                "&:hover": {
                  backgroundColor: "#555",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Se connecter"}
            </Button>
          </>
        );
      case "requestReset":
        return (
          <>
            <Typography variant="h6" align="center" gutterBottom>
              Demande de Réinitialisation
            </Typography>
            <TextField
              label="Adresse Email"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={resetEmail}
              onChange={handleChange}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
            {errors.general && (
              <Alert severity="error" onClose={() => setErrors({ ...errors, general: "" })}>
                {errors.general}
              </Alert>
            )}
            {message && (
              <Alert severity="success" onClose={() => setMessage("")}>
                {message}
              </Alert>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleRequestReset}
              disabled={loading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Envoyer le code"}
            </Button>
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                setStep("login");
                setErrors({ email: "", password: "", general: "" });
                setMessage("");
              }}
              fullWidth
              sx={{ mt: 1 }}
            >
              Retour à la Connexion
            </Button>
          </>
        );
      case "validateCode":
        return (
          <>
            <Typography variant="h6" align="center" gutterBottom>
              Validation du Code
            </Typography>
            <TextField
              label="Code de Réinitialisation"
              type="text"
              variant="outlined"
              fullWidth
              required
              value={resetCode}
              onChange={handleChange}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
            />
            {errors.general && (
              <Alert severity="error" onClose={() => setErrors({ ...errors, general: "" })}>
                {errors.general}
              </Alert>
            )}
            {message && (
              <Alert severity="success" onClose={() => setMessage("")}>
                {message}
              </Alert>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleValidateCode}
              disabled={loading}
              fullWidth
              sx={{ mt: 2 }}
            >
              Valider le code
            </Button>
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                setStep("login");
                setErrors({ email: "", password: "", general: "" });
                setMessage("");
              }}
              fullWidth
              sx={{ mt: 1 }}
            >
              Retour à la Connexion
            </Button>
          </>
        );
      case "resetPassword":
        return (
          <>
            <Typography variant="h6" align="center" gutterBottom>
              Réinitialiser le Mot de Passe
            </Typography>
            <TextField
              label="Nouveau Mot de Passe"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={newPassword.password}
              onChange={handleChange}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirmer le Mot de Passe"
              name="confirmPassword"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={newPassword.confirmPassword}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
              }}
            />
            {errors.general && (
              <Alert severity="error" onClose={() => setErrors({ ...errors, general: "" })}>
                {errors.general}
              </Alert>
            )}
            {message && (
              <Alert severity="success" onClose={() => setMessage("")}>
                {message}
              </Alert>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleResetPassword}
              disabled={loading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Réinitialiser le mot de passe"}
            </Button>
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                setStep("login");
                setErrors({ email: "", password: "", general: "" });
                setMessage("");
              }}
              fullWidth
              sx={{ mt: 1 }}
            >
              Retour à la Connexion
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      padding={2}
    >
      <Card sx={{ maxWidth: 400, width: "100%", padding: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom align="center">
            Connexion Admin
          </Typography>
          <Box component="form" noValidate>
            {renderForm()}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Loginside;
