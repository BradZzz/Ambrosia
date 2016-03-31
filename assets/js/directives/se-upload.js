angular.module('ambrosia').directive('seUpload', ['$rootScope', function ($rootScope) {
  return {
    restrict: 'E',
    templateUrl: '/assets/html/partials/upload-overlay.html',
    scope: {
      id: '@',
      file: '=',
      callback: '&'
    },
    link: function (scope, element, attrs) {

        var creds = {
            bucket: 'project.prototype.cache',
            access_key: 'AKIAIW2AQKQMPLBJEEIQ',
            secret_key: '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',
            region: 'us-west-1',
            base_path: 'https://s3-us-west-1.amazonaws.com/project.prototype.cache/',
            img_path: 'ambrosia/profile_img/' + scope.id + '.png'
        }

        console.log(scope)
        console.log(creds.img_path)

        scope.upload = function (file, invalid) {

          if(file) {
            AWS.config.update({ accessKeyId: creds.access_key, secretAccessKey: creds.secret_key })
            AWS.config.region = creds.region

            var bucket = new AWS.S3({ params: { Bucket: creds.bucket } })

            var params = { Key: creds.img_path, ContentType: file.type, Body: file, ServerSideEncryption: 'AES256' };

            bucket.putObject(params, function(err, data) {
              if(err) {
                // There Was An Error With Your S3 Config
                //alert(err.message)
                console.log(err)
                return false
              }
              else {
                // Success!
                //alert('Upload Done')
                console.log(creds.img_path)
                scope.callback({path : creds.base_path + creds.img_path})
              }
            })
            .on('httpUploadProgress',function(progress) {
                  // Log Progress Information
                  console.log(Math.round(progress.loaded / progress.total * 100) + '% done')
            })
          }
        }
    }
  }
}])
