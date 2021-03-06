import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import prisma from "../../../adapters/prisma";
import serializer from "../../../utilities/serializer";
import SWRProvider from "../../../providers/swr-provider";

interface Props {
  fallback: any;
}

const HomePage: NextPage<Props> = ({ fallback }) => {
  return (
    <SWRProvider fallback={fallback}>
      <section>Hello World!</section>
    </SWRProvider>
  );
};

export default HomePage;

export const getStaticPaths: GetStaticPaths = async () => {
  const users = await prisma.user.findMany();

  const paths = users.map((user) => ({ params: { userId: user.id } }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const userId = String(params!.userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const todos = await prisma.todo.findMany({
    where: { userId },
  });

  return {
    props: {
      fallback: {
        [`/api/users/${userId}`]: serializer(user),
        [`/api/users/${userId}/todos`]: serializer(todos),
      },
    },
    revalidate: 10,
  };
};
