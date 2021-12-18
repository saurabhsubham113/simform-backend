//creating result
const createResult = (error, data) => {
    let result = {}
    if (error) {
        result['success'] = false
        result['error'] = error
    } else {
        result['success'] = true
        result['data'] = data
    }

    return result

}



module.exports = createResult