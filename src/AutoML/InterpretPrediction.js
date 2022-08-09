const _ = require('lodash')

const NormalizeOnlinePrediction = (p) => {

  const baselineScore = _.round(_.get(p, 'baselineScore'), 4)
  const score = _.round(_.get(p, 'score'), 4)
  const predictedGain = _.round(_.get(p, 'value.numberValue'), 4)
  const pIntervalStart = _.round(_.get(p, 'predictionInterval.start'), 4)
  const pIntervalEnd = _.round(_.get(p, 'predictionInterval.end'), 4)
  const importantFeatures = _.chain(p)
    .get('tablesModelColumnInfo')
    .sortBy('featureImportance')
    .takeRight(2)
    .map(({columnDisplayName, featureImportance}) => ({
      columnDisplayName,
      featureImportance: _.round(featureImportance, 4)
    }))
    .value()

  return {
    baselineScore,
    score,
    predictedGain,
    pIntervalStart,
    pIntervalEnd,
    importantFeatures
  }

}

const NormalizeBatchPrediction = (r) => {

  const predictionTable = _.get(r, 'predicted_longGain[0].tables')
  const baselineScore = 0
  const score = 0
  const predictedGain = _.round(_.get(predictionTable, 'value'), 4)
  const pIntervalStart = _.round(_.get(predictionTable, 'prediction_interval.start'), 4)
  const pIntervalEnd = _.round(_.get(predictionTable, 'prediction_interval.end'), 4)
  const importantFeatures = _.chain(r)
    .get('feature_importance')
    .map((val, key) => ({
        columnDisplayName: key,
        featureImportance: _.round(val, 4)
    }))
    .sortBy('featureImportance')
    .takeRight(2)
    .value()
  const ticker = _.get(r, 'ticker')
  const longGain = _.round(_.get(r, 'longGain'), 4)

  return {
    baselineScore,
    score,
    predictedGain,
    pIntervalStart,
    pIntervalEnd,
    importantFeatures,
    ticker,
    longGain
  }
}

module.exports = {
  NormalizeBatchPrediction,
  NormalizeOnlinePrediction
}

    // Sample Important Feature Array.
    // [
    //   {
    //       "columnDisplayName": "meanChangePerc",
    //       "featureImportance": 0.689878523349762
    //   },
    //   {
    //       "columnDisplayName": "deltaDayOPDC",
    //       "featureImportance": 1.076863169670105
    //   }
    // ]
