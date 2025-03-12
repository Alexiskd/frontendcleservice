import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 120px auto 0; /* Même mise en page que pour les Mentions Légales */
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

const Link = styled.a`
  color: #2E7D32;
  text-decoration: underline;
  &:hover {
    color: #1B5E20;
  }
`;

const PolitiqueConfidentialite = () => {
  return (
    <Container>
      {/* Espace supplémentaire de 20px en haut */}
      <div style={{ height: '20px' }}></div>
      <h1>Politique de Confidentialité</h1>
      <p><em>Dernière mise à jour : 04 février 2025</em></p>

      {/* Introduction */}
      <Section>
        <Title>Introduction</Title>
        <Paragraph>
          Bienvenue sur <strong>cleservice.com</strong>, votre site de vente en ligne de clés par envoi postal. Nous accordons une importance particulière à la protection de vos données personnelles. La présente politique de confidentialité a pour objectif de vous informer de manière claire et transparente sur la manière dont nous recueillons, utilisons, stockons et partageons vos informations, dans le strict respect des exigences du Règlement Général sur la Protection des Données (RGPD).
        </Paragraph>
      </Section>

      {/* Collecte des Informations Personnelles */}
      <Section>
        <Title>Collecte des Informations Personnelles</Title>
        <Paragraph>
          Nous recueillons différentes catégories d’informations lors de votre navigation et de vos achats :
        </Paragraph>
        <List>
          <li>
            <strong>Informations directement fournies :</strong> nom, prénom, adresse, adresse e-mail, numéro de téléphone, informations de paiement, informations de facturation et de livraison.
          </li>
          <li>
            <strong>Données de navigation :</strong> adresse IP, type de navigateur, pages consultées, durée des visites et autres données de connexion.
          </li>
          <li>
            <strong>Données issues des cookies et technologies similaires :</strong> préférences de langue, contenu du panier, identifiants de session et autres traceurs pour améliorer votre expérience utilisateur.
          </li>
          <li>
            <strong>Données issues d’interactions :</strong> commentaires, évaluations et réponses à des enquêtes ou jeux-concours.
          </li>
        </List>
      </Section>

      {/* Utilisation des Informations */}
      <Section>
        <Title>Utilisation des Informations</Title>
        <Paragraph>
          Les informations collectées servent à :
        </Paragraph>
        <List>
          <li>Traiter vos commandes et gérer votre compte client.</li>
          <li>Optimiser et personnaliser votre expérience d’achat sur notre site.</li>
          <li>Vous informer sur nos nouveautés, offres promotionnelles et mises à jour, uniquement si vous y avez consenti.</li>
          <li>Analyser le trafic et le comportement des visiteurs afin d’améliorer nos services.</li>
          <li>Prévenir et détecter toute activité frauduleuse ou non autorisée.</li>
        </List>
      </Section>

      {/* Base Légale et Conformité au RGPD */}
      <Section>
        <Title>Base Légale et Conformité au RGPD</Title>
        <Paragraph>
          Le traitement de vos données personnelles repose sur l’obtention de votre consentement explicite, la nécessité d’exécuter un contrat (traitement des commandes) ou le respect d’une obligation légale. Nous nous engageons à respecter l’ensemble des principes du RGPD, notamment en matière de licéité, de transparence et de minimisation des données.
        </Paragraph>
      </Section>

      {/* Partage et Transfert des Données */}
      <Section>
        <Title>Partage et Transfert des Données</Title>
        <Paragraph>
          Vos données ne sont partagées qu’avec des prestataires de services indispensables à l’exécution de nos missions (par exemple, prestataires de paiement, transporteurs, services informatiques) et uniquement dans la mesure nécessaire. Nous ne vendons ni ne louons jamais vos données à des tiers. Le cas échéant, en cas de transfert hors de l’Union Européenne, nous nous assurons que des garanties appropriées sont mises en place.
        </Paragraph>
      </Section>

      {/* Sécurité des Données */}
      <Section>
        <Title>Sécurité des Données</Title>
        <Paragraph>
          Pour protéger vos informations personnelles, nous mettons en œuvre des mesures techniques et organisationnelles adaptées, telles que le cryptage des données, des systèmes d’authentification sécurisés et des audits réguliers. Malgré ces précautions, aucune transmission de données sur Internet ne peut garantir une sécurité absolue.
        </Paragraph>
      </Section>

      {/* Cookies et Technologies de Suivi */}
      <Section>
        <Title>Cookies et Technologies de Suivi</Title>
        <Paragraph>
          Nous utilisons des cookies et technologies similaires pour :
        </Paragraph>
        <List>
          <li>Faciliter votre navigation sur notre site.</li>
          <li>Analyser l’utilisation du site et améliorer ses performances.</li>
          <li>Proposer des contenus personnalisés et des offres adaptées à vos centres d’intérêt.</li>
        </List>
        <Paragraph>
          Vous pouvez gérer vos préférences en matière de cookies via les paramètres de votre navigateur. Notez toutefois que la désactivation des cookies pourrait limiter certaines fonctionnalités de notre site.
        </Paragraph>
      </Section>

      {/* Droits des Utilisateurs */}
      <Section>
        <Title>Droits des Utilisateurs</Title>
        <Paragraph>
          Conformément au RGPD, vous disposez de plusieurs droits concernant vos données personnelles :
        </Paragraph>
        <List>
          <li><strong>Droit d’accès :</strong> obtenir une copie des informations que nous détenons sur vous.</li>
          <li><strong>Droit de rectification :</strong> demander la correction de données inexactes ou incomplètes.</li>
          <li><strong>Droit à l’effacement :</strong> demander la suppression de vos données, sous réserve des obligations légales.</li>
          <li><strong>Droit à la limitation du traitement :</strong> demander la restriction du traitement de vos données dans certaines situations.</li>
          <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré, couramment utilisé et lisible par machine.</li>
          <li><strong>Droit d’opposition :</strong> vous opposer au traitement de vos données pour des motifs légitimes.</li>
          <li><strong>Droit de retirer votre consentement :</strong> vous pouvez à tout moment retirer votre consentement au traitement de vos données, sans que cela n’affecte la légalité du traitement effectué avant le retrait.</li>
        </List>
      </Section>

      {/* Conservation des Données */}
      <Section>
        <Title>Conservation des Données</Title>
        <Paragraph>
          Vos données personnelles sont conservées pendant la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées. Par exemple, les données relatives à vos commandes seront conservées pendant la durée légale requise, tandis que les données de navigation pourront être supprimées ou anonymisées après une période déterminée.
        </Paragraph>
      </Section>

      {/* Modifications de la Politique */}
      <Section>
        <Title>Modifications de la Politique de Confidentialité</Title>
        <Paragraph>
          Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment afin de tenir compte des évolutions législatives ou de nos pratiques internes. Toute modification sera publiée sur cette page et, si nécessaire, notifiée par e-mail. Nous vous encourageons à consulter régulièrement cette page pour rester informé(e) des éventuelles mises à jour.
        </Paragraph>
      </Section>

      {/* Nous Contacter */}
      <Section>
        <Title>Nous Contacter</Title>
        <Paragraph>
          Pour toute question relative à notre politique de confidentialité ou pour exercer vos droits, vous pouvez nous contacter :
        </Paragraph>
        <Paragraph>
          <strong>Email :</strong> support@cleservice.com<br />
          <strong>Adresse postale :</strong> 123 Rue de l'Exemple, 75000 Paris, France
        </Paragraph>
      </Section>

      <footer style={{ marginTop: '40px', fontSize: '0.9rem', color: '#555', textAlign: 'center' }}>
        <p>&copy; {new Date().getFullYear()} cleservice.com. Tous droits réservés.</p>
      </footer>
    </Container>
  );
};

export default PolitiqueConfidentialite;
