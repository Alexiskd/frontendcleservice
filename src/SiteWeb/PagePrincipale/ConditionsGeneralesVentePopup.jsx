import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';

const ConditionsGeneralesVentePopup = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Conditions Générales de Vente - Cleservice.com</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 2 }}>
          {/* Articles 1 à 4 */}
          <Typography variant="h6" gutterBottom>
            Article 1 : Objet
          </Typography>
          <Typography variant="body2" paragraph>
            Les présentes Conditions Générales de Vente (CGV) régissent la vente de clés, cartes de propriété et autres services proposés sur le site Cleservice.com.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Article 2 : Prix
          </Typography>
          <Typography variant="body2" paragraph>
            Tous les prix affichés sont en euros, toutes taxes comprises (TTC). Cleservice.com se réserve le droit de modifier ses tarifs à tout moment sans préavis.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Article 3 : Commande
          </Typography>
          <Typography variant="body2" paragraph>
            La validation de la commande vaut acceptation des présentes CGV. Toute commande effectuée sur le site implique l’adhésion complète aux conditions de vente en vigueur.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Article 4 : Livraison et Retrait
          </Typography>
          <Typography variant="body2" paragraph>
            Les produits commandés sont livrés à l’adresse indiquée lors de la commande. Le retrait en magasin reste gratuit, tandis que l’expédition entraîne des frais supplémentaires indiqués lors de la commande.
          </Typography>

          {/* Articles suivants */}
          <Typography variant="h6" gutterBottom>
            Article 5 : Responsabilité et Garanties
          </Typography>
          <Typography variant="body2" paragraph>
            Cleservice.com ne pourra être tenue responsable des dommages directs ou indirects liés à l’utilisation des produits, sauf en cas de faute grave ou intentionnelle. Les produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Article 6 : Propriété Intellectuelle
          </Typography>
          <Typography variant="body2" paragraph>
            L’ensemble des éléments présents sur le site (textes, images, logos, etc.) est protégé par le droit d’auteur et ne peut être reproduit, distribué ou exploité sans l’autorisation expresse de Cleservice.com.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Article 7 : Données Personnelles
          </Typography>
          <Typography variant="body2" paragraph>
            Les informations recueillies lors de la commande sont nécessaires au traitement de celle-ci. Conformément à la loi « Informatique et Libertés », vous disposez d’un droit d’accès, de modification et de suppression de vos données personnelles.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Article 8 : Loi Applicable et Juridiction
          </Typography>
          <Typography variant="body2" paragraph>
            Les présentes CGV sont régies par la loi française. En cas de litige, seuls les tribunaux français seront compétents.
          </Typography>
          
          {/* Nouveaux articles */}
          <Typography variant="h6" gutterBottom>
            Article 9 : Livraison, Sécurité et Transfert de Risque
          </Typography>
          <Typography variant="body2" paragraph>
            Les clés, cartes de propriété et autres produits restent la propriété de Cleservice.com jusqu’à confirmation du paiement complet. Le transfert des risques intervient dès la livraison effective aux coordonnées indiquées par le client. Cleservice.com ne pourra être tenue responsable des pertes, détériorations ou vol de produits après expédition, sauf en cas de faute avérée du transporteur.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Article 10 : Reproduction et Contrefaçon
          </Typography>
          <Typography variant="body2" paragraph>
            Toute reproduction, duplication, modification ou imitation, totale ou partielle, des clés, cartes de propriété ou autres produits fournis par Cleservice.com est strictement interdite. Toute infraction à cette disposition fera l’objet de poursuites judiciaires. Le client s’engage à ne pas faire de copies ou reproductions non autorisées des produits reçus.
          </Typography>
          <Typography variant="h6" gutterBottom>
            Article 11 : Envoi et Utilisation des Clés
          </Typography>
          <Typography variant="body2" paragraph>
            L’envoi des clés ou des cartes de propriété se fait sous la responsabilité du client dès leur remise au transporteur. Le client s’engage à vérifier l’état du colis à la réception et à signaler toute anomalie dans un délai de 48 heures. Toute utilisation frauduleuse ou détournée des produits sera considérée comme une violation grave des présentes CGV et pourra donner lieu à des poursuites civiles et pénales.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConditionsGeneralesVentePopup;
