import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"

/**
 * get limited display post per load
 */
@Injectable()
export class PostProvider {
  ref: any
  data = []
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("post")
  }
  getPostList(userList, event) {
    // check if friendlist vaild
    var list = []
    var userLength = userList.length - 1
    console.log(userList)
    userList.forEach((userId, userIndex) => {
      this.ref.orderByChild("userId").equalTo(userId).once("value").then(userPostDataListSnap => {
        var userPostDataList = userPostDataListSnap.val()
        if(this.service.valid(userPostDataList)) {
          list = this.service.objToList(userPostDataList)
        }
        if(userLength === userIndex) {
          var end = list.length - 1
          if(end >= 0) {
            list.forEach((listData, listIndex) => {
              if(listData.image === undefined) {
                listData.image = []
              }
              this.ref.parent.child("like").orderByChild("postId").equalTo(listData.id).once("value")
                .then(likeSnap => {
                  var like = this.service.objToList(likeSnap.val())
                  
                  listData["like"] = like
                  this.data[listData.id] = listData
                  if(listIndex === end) {
                    this.service.event.publish(event, list)
                  }
              })
            })  
          }
          else {
            this.service.event.publish(event, list)
          }
        }
      })
    });
  }
  // this function may error
  // ref error
  
  pushAPost(userId, content, image, type, event) {
    this.service.event.publish("loading-start")
    var postId = this.ref.push().key
    var currTime = Date.now()
    var postData
    postData = {
      userId: userId,
      type: type,
      time: currTime,
      msg: content,
      image: image,
      like: []
    }
    var updateData = {}
    updateData["post/" + postId] = postData
    this.ref.parent.update(updateData).then(() => {
      postData.id = postId
      postData.time = new Date(postData.time)
      this.data[postId] = postId

      this.service.event.publish(event, postId)
      this.service.event.publish("loading-end")
    })
  }
  
  changePostContent(postId, content, image) {
    this.service.event.publish("loading-start")
    console.log(postId, content, image)
    var currTime = Date.now()
    var updateData
    var detailPost = {
      msg: content,
      image: image
    }
    image.forEach(image => {
      updateData["postImage/" + image.imageId] = image
    })
    this.ref.child("detail/" + postId).update(detailPost).then(() => {
      this.data[postId].msg = content
      this.data[postId].image = image
      this.service.event.publish("loading-end")
    })
  }

  deletePost(userId, postId) {
    this.service.event.publish("loading-start")  
    var updateData = {}
    updateData[postId] = null
    this.ref.update(updateData).then(() => {
      this.data[postId] = null
      this.service.event.publish("remove-post-list", postId)  
      this.service.event.publish("loading-end")  
    })
  }
  
  like(userId, postId) {
    this.service.event.publish('loading-start')
    var key = this.ref.parent.child("like").push().key
    var updateData = {
      userId: userId,
      postId: postId
    }
    this.ref.parent.child("like/" + key).update(updateData).then(() => {
      updateData["id"] = key
      this.data[postId].like.push(updateData)
      console.log(this.data)
      this.service.event.publish('loading-end')
    })
  }

  // ???
  unlike(userId, postId) {
    this.service.event.publish('loading-start')
    var index = this.service.findIndex(this.data[postId].like, userId, "userId")
    var likeId = this.data[postId].like[index].id
    this.ref.parent.child("like/" + likeId).remove().then(() => {
      this.data[postId].like = this.data[postId].like.filter(liker => {
        return liker.userId !== userId 
      })
      this.service.event.publish('loading-end')
    })
  }
  
  comment(userId, postId, msg) {
    this.service.event.publish('loading-start')
    var currTime = Date.now()
    var commentData
    commentData = {
      userId: userId,
      postId: postId,
      msg: msg,
      time: currTime
    }
    // realtime issue
    this.ref.parent.child("comment").push(commentData).then(() => {
      this.service.event.publish('loading-end')
    })
  }
  changeComment(commentId, msg) {
    this.service.event.publish("loading-start")
    this.ref.parent.child("comment/" + commentId).update({msg: msg}).then(() => {
      this.service.event.publish("loading-end")
    })
  }
  delComment(commentId) {
    this.service.event.publish('loading-start')
    console.log(commentId)
    this.ref.parent.child("comment/" + commentId).remove().then(() => {
      this.service.event.publish('loading-end')
    })
  }
  likeComment(userId, commentId) {
    this.service.event.publish('loading-start')
    var key = this.ref.parent.child("like").push().key
    var updateData = {
      userId: userId,
      postId: commentId
    }
    this.ref.parent.child("like/" + key).update(updateData).then(() => {
      updateData["id"] = key
      this.service.event.publish('comment-like', ([commentId,updateData]))
      this.service.event.publish('loading-end')
    })
  }

  unlikeComment(userId, commentId, likeList) {
    this.service.event.publish('loading-start')
    var index = this.service.findIndex(likeList, userId, "userId")
    var likeId = likeList[index].id
    this.ref.parent.child("like/" + likeId).remove().then(() => {
      this.service.event.publish('comment-unlike', (commentId))
      this.service.event.publish('loading-end')
    })
  }
  
  /*
  subcomment(userId, postId, subcomment, commentIndex, msg) {
    this.service.event.publish('loading-start')
    var currTime = Date.now()
    subcomment.push({
      userId: userId,
      msg: msg,
      time: currTime
    })
    // realtime issue
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/comment")
        .update(subcomment).then(() => {
          subcomment[subcomment.length - 1].time = new Date(subcomment.time)
          this.detail[postId].comment[commentIndex].subcomment = subcomment
          this.service.event.publish('loading-end')
        })
  }
  delSubcomment(postId, subcomment, commentIndex, subcommentIndex) {
    this.service.event.publish('loading-start')
    subcomment = subcomment.filter((subcommentData, index) => {
      return subcommentIndex !== index
    })
    // realtime issue
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/comment")
        .update(subcomment).then(() => {
          this.detail[postId].comment[commentIndex].subcomment = subcomment
          this.service.event.publish('loading-end')
        })
  }
  likeSubcomment(userId, postId, commentIndex, subcommentIndex, like) {
    this.service.event.publish('loading-start')
    if(like === undefined) {
      like = []
    }
    like.push(userId)
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/comment/" +
        subcommentIndex + "/like").set(like).then(() => {
          this.detail[postId].comment[commentIndex].comment[subcommentIndex].like = like
          this.service.event.publish('loading-end')
        })
  }

  unlikeSubcomment(userId, postId, commentIndex, subcommentIndex, like) {
    this.service.event.publish('loading-start')
    like = like.filter(likedUser => {
      return likedUser !== userId
    })
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/comment/" +
        subcommentIndex + "/like").set(like).then(() => {
          this.detail[postId].comment[commentIndex].comment[subcommentIndex].like = like
          this.service.event.publish('loading-end')
        })
  }*/
}
