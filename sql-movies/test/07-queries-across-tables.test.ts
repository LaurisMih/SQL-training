import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("06", "07");
  }, minutes(3));

  it(
    "should select top three directors ordered by total budget spent in their movies",
    async done => {
        const query = `Select directors.full_name as director,
        Round(sum(movies.budget_adjusted), 2) as total_budget
        from movie_directors
        inner join directors
        on directors.id = movie_directors.director_id
        inner join movies
        on movies.id = movie_directors.movie_id
        group by directors.full_name
        order by round(sum(movies.budget_adjusted), 2) desc
        Limit 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          director: "Ridley Scott",
          total_budget: 722882143.58
        },
        {
          director: "Michael Bay",
          total_budget: 518297522.1
        },
        {
          director: "David Yates",
          total_budget: 504100108.5
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top 10 keywords ordered by their appearance in movies",
    async done => {
        const query = `select
        keywords.keyword AS 'keyword',
        count(movie_keywords.movie_id) as 'count'
        from keywords
        inner join movie_keywords
        on keywords.id = movie_keywords.keyword_id
        group by keywords.keyword
        order by COUNT(movie_keywords.movie_id) DESC
        limit 10`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          keyword: "woman director",
          count: 162
        },
        {
          keyword: "independent film",
          count: 115
        },
        {
          keyword: "based on novel",
          count: 85
        },
        {
          keyword: "duringcreditsstinger",
          count: 82
        },
        {
          keyword: "biography",
          count: 78
        },
        {
          keyword: "murder",
          count: 66
        },
        {
          keyword: "sex",
          count: 60
        },
        {
          keyword: "revenge",
          count: 51
        },
        {
          keyword: "sport",
          count: 50
        },
        {
          keyword: "high school",
          count: 48
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select all movies called Life and return amount of actors",
    async done => {
        const query = `select original_title,
        count(distinct actor_id) AS 'count'
        from movie_actors
        inner JOIN movies
        on movie_actors.movie_id = movies.id
        where original_title LIKE 'life'`;
      const result = await db.selectSingleRow(query);

      expect(result).toEqual({
        original_title: "Life",
        count: 12
      });

      done();
    },
    minutes(3)
  );

  it(
    "should select three genres which has most ratings with 5 stars",
    async done => {
        const query = `select
        genres.genre,
            sum(case
            when rating = 5 then 1
            else 0
            end
            ) as five_stars_count
        from movie_ratings
        inner JOIN movies
        on movie_ratings.movie_id = movies.id
        inner JOIN movie_genres
        on movies.id = movie_genres.movie_id
        inner join genres
        on genres.id = movie_genres.genre_id
        group by genre
        order by five_stars_count DESC
        limit 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Drama",
          five_stars_count: 15052
        },
        {
          genre: "Thriller",
          five_stars_count: 11771
        },
        {
          genre: "Crime",
          five_stars_count: 8670
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three genres ordered by average rating",
    async done => {
        const query = `select
        genres.genre,
        round( avg(movie_ratings.rating), 2 ) as avg_rating
        from movie_ratings
        inner join movies
        on movie_ratings.movie_id = movies.id
        inner JOIN movie_genres
        on movies.id = movie_genres.movie_id
        inner join genres
        on genres.id = movie_genres.genre_id
        group by genre
        order by avg_rating DESC
        limit 3`;
      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Crime",
          avg_rating: 3.79
        },
        {
          genre: "Music",
          avg_rating: 3.73
        },
        {
          genre: "Documentary",
          avg_rating: 3.71
        }
      ]);

      done();
    },
    minutes(3)
  );
});
