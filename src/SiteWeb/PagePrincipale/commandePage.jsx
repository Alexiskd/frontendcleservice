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
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur ${res.status} : ${text}`);
      }
      const { data, count } = await res.json();
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
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  if (loading) return (
    <Container sx={{ textAlign: 'center', mt: 4 }}>
      <CircularProgress />
    </Container>
  );
  if (error) return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Commandes payées
      </Typography>

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
    </Container>
  );
};

export default CommandePage;
