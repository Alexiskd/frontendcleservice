// src/pages/CommandePage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  CircularProgress,
  Alert,
} from '@mui/material';

const CommandePage = () => {
  const [commandes, setCommandes] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);           // zéro-based pour TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCommandes = async (pageParam = 1, limitParam = rowsPerPage) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://cl-back.onrender.com/commande/paid?page=${pageParam}&limit=${limitParam}`
      );
      const text = await res.text();

      if (!res.ok) {
        // Essaie d'extraire un message JSON si possible
        let msg = text;
        try {
          const json = JSON.parse(text);
          msg = json.detail || json.message || JSON.stringify(json);
        } catch {
          // reste sur le texte brut
        }
        throw new Error(msg);
      }

      const { data, count } = JSON.parse(text);
      setCommandes(data);
      setCount(count);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes(page + 1, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Commandes payées
      </Typography>

      {loading && (
        <Container sx={{ textAlign: 'center', mt: 4 }}>
          <CircularProgress />
        </Container>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Erreur lors du chargement des commandes : {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Numéro de commande</TableCell>
                <TableCell>Nom du client</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Adresse postale</TableCell>
                <TableCell>Produit(s)</TableCell>
                <TableCell>Quantité</TableCell>
                <TableCell>Prix total (€)</TableCell>
                <TableCell>Date de commande</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commandes.map((cmd) => (
                <TableRow key={cmd.id}>
                  <TableCell>{cmd.numeroCommande}</TableCell>
                  <TableCell>{cmd.nom}</TableCell>
                  <TableCell>{cmd.adresseMail}</TableCell>
                  <TableCell>{cmd.telephone}</TableCell>
                  <TableCell>{cmd.adressePostale}</TableCell>
                  <TableCell>{cmd.cle.join(', ')}</TableCell>
                  <TableCell>{cmd.quantity}</TableCell>
                  <TableCell>{parseFloat(cmd.prix).toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(cmd.createdAt).toLocaleString('fr-FR')}
                  </TableCell>
                </TableRow>
              ))}
              {commandes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Aucune commande payée trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={count}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Lignes par page"
            sx={{ mt: 2 }}
          />
        </>
      )}
    </Container>
  );
};

export default CommandePage;
