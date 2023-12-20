import { Handler } from '@netlify/functions';
import { CustomError } from './helpers/errors';
import Recipe from './models/recipe.model';
import { paginate } from './helpers/pagination';
import { connectDB } from './helpers/database';
import { getFunctionHost } from './helpers/context';

const databaseConnected = connectDB(process.env.MONGODB_URI);

export const handler: Handler = async (event, context) => {
  const searchType = event.queryStringParameters?.searchType || 'title';
  const searchText = event.queryStringParameters?.searchText || '';

  let filter = {};

  let regex = new RegExp('.*');

  try {
    regex = new RegExp(
      searchText.toString().length > 0 ? searchText.toString() : '.*',
      'i'
    );
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(new CustomError('Could not create regex', error)),
    };
  }

  switch (searchType) {
    case 'title':
      filter = { title: regex };
      break;
    case 'ingredient':
      filter = { 'ingredients.name': regex };
      break;
    case 'tag':
      filter = { 'tags.value': regex };
      break;
  }

  const url = new URL(getFunctionHost(event, context) + '/api/recipeGetAll');

  if (searchType !== 'title') {
    url.searchParams.append('searchType', searchType.toString());
  }
  if (searchText) {
    url.searchParams.append('searchText', searchText.toString());
  }

  try {
    await databaseConnected;
    const query = Recipe.find(filter);
    const paginatedResult = await paginate(
      query,
      url,
      event.queryStringParameters ?? {}
    );

    return {
      statusCode: 200,
      body: JSON.stringify(paginatedResult),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(new CustomError('Could not paginate result', error)),
    };
  }
};
