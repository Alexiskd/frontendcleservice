import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 20px auto 0; /* 20px d'espace en haut, centré horizontalement */
  font-family: 'Arial, sans-serif';
  line-height: 1.6;
  color: #333;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: bold;
  color: #2E7D32;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 5px;
`;

const Paragraph = styled.p`
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const List = styled.ul`
  list-style: disc;
  margin-left: 20px;
  font-size: 0.9rem;
`;

const ConditionsGeneralesDeVente = () => {
  return (
    <Container>
      {/* Espace supplémentaire de 20px en haut */}
      <div style={{ height: '20px' }}></div>

      <h1>Conditions Générales de Vente</h1>

      {/* Objet */}
      <Section>
        <Title>Objet</Title>
        <Paragraph>
          Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Maison Bouvet S.A.S. (ci-après "le Vendeur") et tout client souhaitant effectuer un achat sur le site <strong>cleservice.com</strong> (ci-après "l'Acheteur").
        </Paragraph>
      </Section>

      {/* Produits */}
      <Section>
        <Title>Produits</Title>
        <Paragraph>
          Les produits proposés à la vente sont présentés avec la plus grande exactitude possible. En cas d'erreur ou d'omission, le Vendeur se réserve le droit de corriger les informations sans que cela n'engage sa responsabilité.
        </Paragraph>
      </Section>

      {/* Prix */}
      <Section>
        <Title>Prix</Title>
        <Paragraph>
          Les prix indiqués sur le site sont exprimés en euros, toutes taxes comprises (TTC) et peuvent être modifiés à tout moment. Le prix applicable à l'achat est celui en vigueur au moment de la validation de la commande.
        </Paragraph>
      </Section>

      {/* Commande */}
      <Section>
        <Title>Commande</Title>
        <Paragraph>
          Toute commande passée sur le site implique l'acceptation sans réserve des présentes CGV. L'Acheteur déclare avoir pris connaissance de ces conditions avant de valider sa commande.
        </Paragraph>
      </Section>

      {/* Paiement */}
      <Section>
        <Title>Paiement</Title>
        <Paragraph>
          Le paiement s'effectue en ligne par carte bancaire ou via d'autres moyens de paiement proposés sur le site. Le Vendeur garantit la sécurité des transactions.
        </Paragraph>
      </Section>

      {/* Livraison */}
      <Section>
        <Title>Livraison</Title>
        <Paragraph>
          Les produits sont livrés à l'adresse indiquée par l'Acheteur lors de la commande. Les délais de livraison, précisés sur le site, peuvent varier en fonction de la destination. Tout retard ne pourra être imputé au Vendeur.
        </Paragraph>
      </Section>

      {/* Droit de Rétractation */}
      <Section>
        <Title>Droit de Rétractation</Title>
        <Paragraph>
          Conformément à la législation en vigueur, l'Acheteur dispose d'un délai de 14 jours à compter de la réception des produits pour exercer son droit de rétractation, sans avoir à justifier de motifs. Les frais de retour sont à la charge de l'Acheteur, sauf indication contraire.
        </Paragraph>
      </Section>

      {/* Garantie */}
      <Section>
        <Title>Garantie</Title>
        <Paragraph>
          Les produits vendus bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés, conformément aux dispositions légales en vigueur.
        </Paragraph>
      </Section>

      {/* Responsabilité */}
      <Section>
        <Title>Responsabilité</Title>
        <Paragraph>
          Le Vendeur ne pourra être tenu responsable des dommages directs ou indirects résultant de l'utilisation des produits. La responsabilité du Vendeur est limitée au montant de la commande.
        </Paragraph>
      </Section>

      {/* Droit Applicable et Juridiction */}
      <Section>
        <Title>Droit Applicable et Juridiction</Title>
        <Paragraph>
          Les présentes CGV sont régies par le droit français. En cas de litige, seuls les tribunaux de Paris seront compétents, sauf disposition légale contraire.
        </Paragraph>
      </Section>

      {/* Modification des CGV */}
      <Section>
        <Title>Modification des CGV</Title>
        <Paragraph>
          Le Vendeur se réserve le droit de modifier les présentes Conditions Générales de Vente à tout moment. Les modifications seront publiées sur le site et s'appliqueront à toutes les commandes passées après leur mise en ligne.
        </Paragraph>
      </Section>

      <footer style={{ textAlign: 'center', fontSize: '0.9rem', color: '#555', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
        <p>&copy; {new Date().getFullYear()} cleservice.com - Tous droits réservés.</p>
      </footer>
    </Container>
  );
};

export default ConditionsGeneralesDeVente;
