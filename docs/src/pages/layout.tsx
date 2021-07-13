import styles from '../styles/Layout.module.scss';
import { Header } from '../components/Header/Header';
import { Reference, ReferenceType } from '../components/Reference/Reference';
import { TableOfContents } from '../components/TableOfContents/TableOfContents';
import { useCallback, useState } from 'react';

const reference: ReferenceType = [
  {
    heading: 'Introduction',
  },
  {
    heading: 'Overview',
    sections: ['first', 'second', 'third', 'forth'],
  },
  {
    heading: 'Introduction',
    sections: ['first', 'second', 'third', 'forth'],
  },
  {
    heading: 'Introduction',
    sections: ['first', 'second', 'third', 'forth'],
  },
  {
    heading: 'Introduction',
    sections: ['first', 'second', 'third', 'forth'],
  },
];

export default function Layout() {
  const [menuOpened, setMenuOpened] = useState<boolean>(false);
  const toggleMenuOpened = useCallback(() => setMenuOpened((prev) => !prev), []);

  return (
    <div className={styles.container}>
      <Header toggleMenuOpened={toggleMenuOpened} />
      <main className={styles.main}>
        <Reference reference={reference} menuOpened={menuOpened} />
        <article className={styles.article}>
          <h1 className={styles.articleHeading}>Getting started</h1>
          <p className={styles.articleParagraph}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil modi nobis, accusantium ipsum quis aspernatur
            deleniti blanditiis distinctio illo repudiandae commodi aperiam officiis consequatur eius. Quos saepe
            adipisci quidem delectus. Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates facere vero
            alias repellat quisquam suscipit, mollitia dolorem in at tempora nemo dicta hic doloremque sunt eos error ea
            consectetur. Corporis!
          </p>
          <h2 className={styles.articleHeading}>Hello from the moon</h2>
          <p className={styles.articleParagraph}>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aspernatur voluptates nostrum in architecto illo
            voluptatum sunt iusto alias quibusdam labore molestiae quo omnis maiores obcaecati dolorem atque, mollitia
            consequatur quisquam fuga eius commodi quasi cumque! Alias maxime veniam nobis impedit quia nemo maiores,
            aliquam itaque perferendis ad doloribus corporis velit eius beatae inventore magni, adipisci incidunt
            praesentium laudantium asperiores esse quisquam! Beatae odio doloribus dolore molestiae sequi a accusantium
            nulla nihil voluptatum quam, iure, consectetur qui ipsam ea illum itaque aperiam. Neque consectetur ipsa
            adipisci tenetur hic architecto commodi, libero quis accusantium facilis quos natus rerum sapiente sed eius
            repellat dolor, fugit maiores eum. Vel ex asperiores esse ratione beatae! Veritatis, natus pariatur
            perspiciatis fuga nisi tempore harum fugiat quas, dicta eum recusandae quibusdam! Incidunt maxime quidem
            eveniet voluptate praesentium nesciunt, eaque sit harum labore aut sapiente voluptas, magni, atque
            consectetur dolore! Ipsa, vel. Animi dolorum debitis nam nesciunt eaque sapiente quos deleniti natus
            voluptates earum officiis nemo velit, similique praesentium eligendi reiciendis ducimus autem harum officia
            ipsum eos et. Qui ducimus praesentium sequi sapiente dicta quam, hic doloremque ipsum iusto temporibus
            excepturi ipsa voluptatibus quidem nam voluptates maiores debitis dignissimos totam autem, laudantium
            adipisci consectetur. Similique dolor mollitia nesciunt!
          </p>
          <h2 className={styles.articleHeading}>I love the stars</h2>
          <p className={styles.articleParagraph}>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Repellendus quisquam aliquid distinctio fugit
            totam laboriosam reiciendis quod. Ratione sequi laborum aspernatur quidem eius corrupti earum quis rerum
            debitis eos amet voluptatum vel officia enim veniam dolorem, reprehenderit cum quae maxime deleniti dolorum
            necessitatibus a nulla. Quae rerum corrupti ipsam?
          </p>
          <h2 className={styles.articleHeading}>It's too late</h2>
          <p className={styles.articleParagraph}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum atque labore, quos non veniam placeat ut eius
            nulla delectus dicta voluptatibus eveniet consequatur minima doloremque repudiandae numquam quod mollitia
            consequuntur temporibus quam aperiam velit odit alias! Voluptate, quam voluptas at, nihil animi sapiente
            tempore cum iste consectetur fugit recusandae incidunt reprehenderit quasi nam enim. Laboriosam iste,
            nesciunt, sunt quis perspiciatis repellendus assumenda a amet ad fuga quia adipisci error eum hic officia?
            Ducimus consequuntur illo aperiam repellat distinctio eaque excepturi eveniet adipisci! Facilis reiciendis
            nobis quod. Facilis recusandae nobis numquam sunt harum consectetur voluptatem id? Laborum possimus rerum
            est nulla facilis, minima non corrupti quod! Dolorum maiores unde, perspiciatis repellat mollitia, nam
            veniam doloremque nostrum impedit ab, nisi sed! Eveniet praesentium repellat quas consectetur neque
            molestias velit, tempore facilis adipisci iusto deserunt. Libero, incidunt tempore recusandae ducimus iste
            sequi ipsum saepe quibusdam consequatur id hic? Voluptatem deleniti deserunt eos vitae labore rerum unde
            aspernatur ipsa molestias, maiores ipsam eaque, sunt eveniet quo error sequi? Totam temporibus ipsam tempora
            placeat, reiciendis suscipit praesentium pariatur alias amet ab, doloremque non molestiae unde repudiandae?
            Velit tempore ex nam at harum, perferendis, temporibus asperiores quibusdam rerum esse perspiciatis ullam
            qui adipisci, error aliquid reprehenderit earum reiciendis assumenda quaerat quo repellendus accusantium
            atque doloremque voluptate? Obcaecati error incidunt provident sapiente ea nobis quos animi hic praesentium
            ipsam aperiam voluptate quaerat, tempore facere. Enim temporibus aut corrupti inventore! Error officia
            dolorem culpa dignissimos, qui id nulla? Magni sapiente beatae velit nostrum illum vitae explicabo quod,
            officia voluptatem, molestias animi quisquam ex, aliquid consequatur ipsam odio laborum atque illo
            voluptates non deserunt ut qui quis nam! Molestiae fuga, minus ad quia voluptates expedita nemo illo fugit
            labore hic magni laboriosam velit eos unde nisi nam officia delectus ipsum deleniti eaque cumque itaque quos
            quibusdam eius. Magni alias laboriosam quidem ipsum, ullam nihil laudantium explicabo eligendi autem!
          </p>
        </article>
        <TableOfContents
          headings={[
            'My green tea is sweety',
            'I love the color of the desk',
            'I hope that it will end',
            'Maybe it is a dream',
            'This has to be a snatch',
          ]}
          activeHeading="Maybe it is a dream"
        />
      </main>
    </div>
  );
}
