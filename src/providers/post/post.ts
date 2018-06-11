import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"

/**
 * get limited display post per load
 */
@Injectable()
export class PostProvider {
  ref: any
  data = {}
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("post")
  }
  setPost(postKey, postData) {
    if(!this.data[postKey]) {
      this.data[postKey] = postData
    }
  }
  setPostList(postDataList) {
    var postIdList = []
    for (const key in postDataList) {
      if (postDataList.hasOwnProperty(key)) {
        const postData = postDataList[key];
        if(postIdList.indexOf(key) === -1) {
          postIdList.push(key)
        }
        this.setPost(key, postData)
      }
    }
    return postIdList
  }
  getPostList(userList, event) {
    // check if friendlist vaild
    var list = []
    var end1 = userList.length - 1
    userList.forEach((userId, userIndex) => {
      this.ref.orderByChild("userId").equalTo(userId).once("value").then(userPostDataListSnap => {
        var userPostDataList = userPostDataListSnap.val()
        if(this.service.valid(userPostDataList)) {
          var list2 = this.service.objToList(userPostDataList)
          list2.forEach(data => {
            list.push(data.id)
          })
          var length2 = list2.length
        }
        if(end1 === userIndex) {
          console.log(!length2)
          if(!length2) {
            this.service.event.publish(event, list)
          }
          else {
            var end2 = length2 - 1
          }
        }
        if(length2) {
          list2.forEach((listData, listIndex) => {
            if(listData.image === undefined) {
              listData.image = []
            }
            this.ref.parent.child("like").orderByChild("postId").equalTo(listData.id).once("value")
              .then(likeSnap => {
                var like = this.service.objToList(likeSnap.val())
                
                listData["like"] = like
                this.data[listData.id] = listData
                if(end2 !== undefined && listIndex === end2) {
                  this.service.event.publish(event, list)
                }
            })
          })
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
      ownerId: userId,
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
      this.data[postId] = postData

      this.service.event.publish(event, postId)
      this.service.event.publish("loading-end")
    })
  }
  
  changePostContent(postId, content, image) {
    this.service.event.publish("loading-start")
    console.log(postId, content, image)
    //var currTime = Date.now()
    //var updateData
    var detailPost = {
      msg: content,
      image: image
    }
    this.ref.child(postId).update(detailPost).then(() => {
      this.data[postId].msg = content
      this.data[postId].image = image
      console.log(this.data[postId])
      
      this.service.event.publish("loading-end")
    })
  }

  deletePost(postId) {
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
    console.log(this.data)
    console.log(updateData)
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
    var likeId = this.data[postId].like[index].likeId
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
      this.service.event.publish('comment-push')
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
