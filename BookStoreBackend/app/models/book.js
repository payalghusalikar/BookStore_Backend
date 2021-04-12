const userBucket = require('../../config/dbConfig').userBucket;
const bookBucket = require('../../config/dbConfig').bookBucket;
const N1qlQuery = require('../../config/dbConfig').N1qlQuery;
const uuid = require('uuid').v4;
const config = require('../../config').get();
const { logger } = config;


class BookModel {
    /**
     * @description saving book into buckets
     * @method insert is used to save book into bucket
     */
    save = async(bookData, callback) => {
        await userBucket.get(bookData.adminId.toString(), async(error, user) => {
            if (error)
                return callback(error, null);
            else if (user.length == 0)
                return callback(null, user);
            else {
                const data = {
                    author: bookData.author,
                    title: bookData.title,
                    quantity: bookData.quantity,
                    price: bookData.price,
                    description: bookData.description
                }
                logger.info('creating unique id');
                const id = uuid();
                await bookBucket.insert(id, data, (error, result) => {
                    return error ? callback(error, null) : callback(null, result);
                });
            }
        });
    }



    getBooks = async (userId, callback) => {
       
        await userBucket.get(userId.toString(), async (error, user) => {
            if (error)
                return callback(error, null);
            else if (user.length == 0)
                return callback(new Error('ERR-401'), null);
            else {
                logger.info('retrieving books');
                await bookBucket.query(
                    N1qlQuery.fromString('SELECT * FROM `books`'), (err, rows) => {
                        return (err) ? callback(err, null) : callback(null, rows);
                    });
            }
        });
    }
}


module.exports = new BookModel();