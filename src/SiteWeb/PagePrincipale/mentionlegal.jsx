import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 120px auto 0; /* 20px d'espace en haut, centré horizontalement */
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

const MentionsLegales = () => {
  return (
    <Container>
      {/* Espace supplémentaire de 20px en haut */}
      <div style={{ height: '20px' }}></div>
      <h1>Mentions Légales</h1>

      {/* Éditeur du Site */}
      <Section>
        <Title>Éditeur du Site</Title>
        <Paragraph>
          Le site <strong>cleservice.com</strong> est édité par Maison Bouvet S.A.S., au capital de 100 000 €, dont le siège social est situé au 20 Rue Lévis, 75017 Paris, France.
          <br />
          RCS : <strong>500 188 339</strong> &nbsp;&mdash;&nbsp; TVA Intracommunautaire : <strong>FR55500188339</strong>.
        </Paragraph>
      </Section>

      {/* Directeur de Publication */}
      <Section>
        <Title>Directeur de Publication</Title>
        <Paragraph>
          Directeur de publication : Monsieur Jean Dupont.
        </Paragraph>
      </Section>

      {/* Hébergeur */}
      <Section>
        <Title>Hébergeur</Title>
        <Paragraph>
          Le site est hébergé par OVH, dont le siège social est situé au 2 rue Kellermann, 59100 Roubaix, France.
        </Paragraph>
      </Section>

      {/* Propriété Intellectuelle */}
      <Section>
        <Title>Propriété Intellectuelle</Title>
        <Paragraph>
          L'ensemble des contenus (textes, images, vidéos, logos, etc.) présents sur ce site est la propriété exclusive de Maison Bouvet S.A.S. Toute reproduction, distribution, modification ou publication sans autorisation préalable écrite est strictement interdite.
        </Paragraph>
      </Section>

      {/* Conditions d'Utilisation */}
      <Section>
        <Title>Conditions d'Utilisation</Title>
        <Paragraph>
          L'accès et l'utilisation du site <strong>cleservice.com</strong> sont soumis aux présentes conditions. En naviguant sur ce site, vous acceptez sans réserve ces conditions. Nous nous réservons le droit de modifier à tout moment ces conditions; les utilisateurs sont invités à les consulter régulièrement.
        </Paragraph>
      </Section>

      {/* Responsabilité */}
      <Section>
        <Title>Responsabilité</Title>
        <Paragraph>
          Maison Bouvet S.A.S. s’efforce d’assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Cependant, elle ne saurait être tenue responsable des erreurs, omissions ou inexactitudes dans les contenus ni de l’utilisation faite de ces informations par les utilisateurs.
        </Paragraph>
      </Section>

      {/* Liens Hypertextes */}
      <Section>
        <Title>Liens Hypertextes</Title>
        <Paragraph>
          Le site peut contenir des liens vers des sites externes. Maison Bouvet S.A.S. n'est pas responsable du contenu ou des pratiques de confidentialité de ces sites. Il est conseillé de consulter les mentions légales et la politique de confidentialité de chaque site visité.
        </Paragraph>
      </Section>

      {/* Données Personnelles et Cookies */}
      <Section>
        <Title>Données Personnelles et Cookies</Title>
        <Paragraph>
          Pour toute question relative à la collecte et au traitement de vos données personnelles, nous vous invitons à consulter notre&nbsp;
          <Link href="/politique-confidentialite">Politique de Confidentialité</Link>.
          <br />
          En utilisant ce site, vous acceptez l'utilisation des cookies pour améliorer votre expérience de navigation.
        </Paragraph>
      </Section>

      {/* Droit Applicable et Juridiction Compétente */}
      <Section>
        <Title>Droit Applicable et Juridiction Compétente</Title>
        <Paragraph>
          Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux de Paris seront seuls compétents, sauf disposition légale contraire.
        </Paragraph>
      </Section>

      {/* Modification des Mentions Légales */}
      <Section>
        <Title>Modification des Mentions Légales</Title>
        <Paragraph>
          Maison Bouvet S.A.S. se réserve le droit de modifier ces mentions légales à tout moment. Les modifications seront publiées sur cette page et prendront effet dès leur mise en ligne.
        </Paragraph>
      </Section>

      {/* Informations Complémentaires */}
      <Section>
        <Title>Informations Complémentaires</Title>
        <Paragraph>
          Pour toute demande d'information complémentaire ou pour exercer vos droits concernant vos données personnelles, vous pouvez nous contacter aux coordonnées suivantes :
        </Paragraph>
        <List>
          <li>
            <strong>Email :</strong> <Link href="mailto:contact@cleservice.com">contact@cleservice.com</Link>
          </li>
          <li>
            <strong>Adresse postale :</strong> 20 Rue Lévis, 75017 Paris, France
          </li>
          <li>
            <strong>Téléphone :</strong> 01 42 67 48 61
          </li>
        </List>
      </Section>

      {/* Crédits et Remerciements */}
      <Section>
        <Title>Crédits et Remerciements</Title>
        <Paragraph>
          Les icônes et illustrations utilisées sur ce site proviennent de sources libres de droits ou ont été spécialement créées pour <strong>cleservice.com</strong>.
        </Paragraph>
      </Section>

      <footer style={{ textAlign: 'center', fontSize: '0.8rem', color: '#777', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
        © {new Date().getFullYear()} Maison Bouvet - Tous droits réservés.
      </footer>
    </Container>
  );
};

export default MentionsLegales;
