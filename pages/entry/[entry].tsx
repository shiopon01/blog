import * as React from "react";
import { NextPage } from "next";
import fetch from "isomorphic-unfetch";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography, CardHeader, Avatar } from "@material-ui/core";

import Layout from "../../src/components/Layout";
import ShareButtons from "../../src/components/ShareButtons";
import ArticleBody from "../../src/components/ArticleBody";
import { HOST } from "../../const";

const useStyles = makeStyles(theme => ({
  container: {
    maxWidth: 720,
    padding: "0px 20px",
    margin: "40px 0px",
    marginLeft: "auto",
    marginRight: "auto"
  },
  article: {
    width: "100%"
  },
  title: {
    [theme.breakpoints.down("xs")]: {
      fontSize: 30
    },
    [theme.breakpoints.up("sm")]: {
      fontSize: 40
    }
  },
  header: {
    fontSize: 16
  },
  avatar: {
    backgroundColor: "red",
    width: 50,
    height: 50
  },
  headerImage: {
    width: "100%"
  },
  bottom: {
    marginTop: 40,
    width: "100%"
  }
}));

const EntryPage: NextPage<any> = (props: any) => {
  const classes = useStyles();

  return (
    <Layout
      type="article"
      title={props.title}
      description={props.body.replace(/\r?\n/g, " ").slice(0, 300) + (props.body.length > 300 ? "…" : "")}
      path={"entry/" + props.path}
    >
      <Grid container className={classes.container}>
        <article className={classes.article}>
          <section>
            {/* タイトル */}
            <Grid container>
              <Grid item xs={12}>
                <Typography variant="h1" className={classes.title}>
                  {props.title}
                </Typography>
              </Grid>
            </Grid>
            {/* 投稿者情報 */}
            <Grid container>
              <Grid item xs={12} sm={6}>
                <CardHeader
                  classes={{ title: classes.header, subheader: classes.header }}
                  avatar={
                    <Avatar aria-label="recipe" className={classes.avatar}>
                      S
                    </Avatar>
                  }
                  title="shiopon01"
                  subheader={props.createdAt}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ShareButtons url={"https://blog.shiopon.net/entry/" + props.path} title={props.title} />
              </Grid>
            </Grid>
            {/* 画像 */}
            {props.image != null && (
              <Grid container>
                <Grid item xs={12}>
                  <img src={props.image} className={classes.headerImage} />
                </Grid>
              </Grid>
            )}
            {/* 記事 */}
            <Grid container>
              <Grid item xs={12}>
                <ArticleBody source={props.body} />
              </Grid>
            </Grid>
          </section>
        </article>
        <div className={classes.bottom}>
          <Grid container>
            <Grid item xs={12}>
              <ShareButtons url={"https://blog.shiopon.net/entry/" + props.path} title={props.title} />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Layout>
  );
};

EntryPage.getInitialProps = async (req: any) => {
  if (process.browser) {
    // @ts-ignore
    return __NEXT_DATA__.props.pageProps;
  }

  const key: string = req.query.entry as string;
  const res = await fetch(HOST + "/api/articles/" + key);
  const data = await res.json();
  return { ...data };
};

export default EntryPage;
