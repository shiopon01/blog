import * as React from "react";
import fetch from "isomorphic-unfetch";
import { NextPage } from "next";

import { makeStyles } from "@material-ui/core/styles";
import {
  Container,
  Grid,
  Typography,
  CardActionArea,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  Avatar
} from "@material-ui/core";

import Layout from "../../src/components/Layout";
import Paginate from "../../src/components/Paginate";
import { HOST } from "../../const";

const useStyles = makeStyles(theme => ({
  container: {
    maxWidth: 1032,
    margin: "40px 0px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  cardDetails: {
    flex: 1
  },
  cardMedia: {
    marginTop: 20,
    height: 180,
    [theme.breakpoints.down("xs")]: {
      height: 100
    }
  },
  title: {
    borderBottom: "1px solid rgba(0,0,0,.05)"
  },
  col: {
    padding: "0 20px"
  },
  content: {
    padding: "20px 0",
    borderBottom: "1px solid rgba(0,0,0,.0785) !important"
  },
  about: {
    padding: "20px 0"
  },
  readmore: {
    marginTop: 10
  },
  entryTitle: {
    marginTop: 20,
    fontSize: 30
  },
  subtitle: {
    fontSize: 24
  },
  avatar: {
    backgroundColor: "red"
  }
}));

const PagePage: NextPage = (props: any) => {
  const classes = useStyles();
  const { pid } = props;
  const list = [];

  for (const entry of props.data) {
    list.push(
      <Grid item xs={12} key={entry.path} className={classes.content}>
        <Card square={false} elevation={0}>
          <CardHeader
            avatar={
              <Avatar aria-label="recipe" className={classes.avatar}>
                S
              </Avatar>
            }
            title="shiopon01"
            subheader={entry.createdAt}
          />
          <a href={"/entry/" + entry.path} style={{ textDecoration: "none", color: "rgba(0, 0, 0, 0.87)" }}>
            <CardActionArea disableRipple={true}>
              <CardMedia className={classes.cardMedia} image={entry.image} title="Contemplative Reptile" />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2" className={classes.entryTitle}>
                  {entry.title}
                </Typography>
                <Typography variant="body1" color="textSecondary" className={classes.subtitle}>
                  {entry.subtitle}
                </Typography>
                <Typography variant="body2" color="textSecondary" className={classes.readmore}>
                  Read more...
                </Typography>
              </CardContent>
            </CardActionArea>
          </a>
        </Card>
      </Grid>
    );
  }

  return (
    <Layout title={`Page ${pid}`}>
      <Container className={classes.container}>
        <Grid container>
          <Grid item xs={12} md={8} className={classes.col}>
            <Typography variant="h6" gutterBottom className={classes.title}>
              Latest - Page {pid}
            </Typography>
            <Grid container>{list}</Grid>
          </Grid>
          <Grid item xs={12} md={4} className={classes.col}>
            <Typography variant="h6" gutterBottom className={classes.title}>
              About
            </Typography>
            <Grid container>
              <Grid item xs={12} className={classes.about}>
                About column
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Paginate page={pid} max={props.count} />
      </Container>
    </Layout>
  );
};

PagePage.getInitialProps = async (req: any) => {
  if (process.browser) {
    // @ts-ignore
    return __NEXT_DATA__.props.pageProps;
  }

  const pid: string = req.query.pid as string;
  const articlesResp = await fetch(HOST + "/api/articles?page=" + pid);
  const countResp = await fetch(HOST + "/api/count/page");

  const articles = await articlesResp.json();
  const count = await countResp.json();
  return { pid, data: articles.articles, count: count.count };
};

export default PagePage;
