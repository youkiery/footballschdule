import { Injectable } from '@angular/core';

import { ServiceProvider } from "../service/service"

/**
 * get limited display post per load
 */
@Injectable()
export class PostProvider {
  ref: any
  advice = []
  list = []
  displayNew = []
  detail = {}
  page = 1
  constructor(private service: ServiceProvider) {
    this.ref = this.service.db.ref("post")
  }
  getPostList(userId, userList) {
    // check if friendlist vaild
    if(userList.indexOf(userId) < 0) {
      userList.push(userId)
    }
    console.log(userList)
    var userListNumber = userList.length - 1
    userList.forEach((userId, userIndex) => {
      this.ref.child("list/" + userId).once("value").then(userPostListSnap => {
        var userPostList = userPostListSnap.val()
        if(this.service.valid(userPostList)) {
          userPostList.forEach(userPostData => {
            userPostData.userId = userId
          })
          console.log(this.list)
          this.list = this.list.concat(userPostList)
          console.log(this.list)
        }
        if(userListNumber === userIndex) {
          if(this.list.length > 1) {
            this.list = this.list.sort((a, b) => {
              return b.time - a.time
            })
          }
          this.service.event.publish("get-post-detail", this.list)
        }
      })
    });
  }
  // this function may error
  getAdvicePostList(userId, adviceUserList) {
    // check if friendlist vaild
    if(adviceUserList.indexOf(userId) < 0) {
      adviceUserList.push(userId)
    }
    var friendListNumber = adviceUserList.length - 1
    
    adviceUserList.forEach((adviceUserId, adviceUserIndex) => {
      this.ref.child("list/" + adviceUserId).once("value").then(advicePostListSnap => {
        var advicePostList = advicePostListSnap.val()
        
        if(this.service.valid(advicePostList)) {
          advicePostList.forEach(advicePostData => {
            advicePostData.userId = adviceUserId
          })
          this.advice = this.advice.concat(advicePostList)
        }
        
        if(friendListNumber === adviceUserIndex) {
          if(this.advice.length > 1) {
            this.advice = this.list.sort((a, b) => {
              return b.time - a.time
            })
          }
          this.service.event.publish("get-post-detail", this.advice)
        }
      })
    });
  }

  getPostDetail(postList, userList) {
    var postRef = this.service.db.ref("post")
    var end = postList.length
    if(end) {
      var from = 0
      var to = end > 8 ? 8 : end
      end = to - 1
      var postListToLoad = []
      while(from < to) {
        postListToLoad.push(postList[from])
        from ++
      }
      postListToLoad.forEach((postData, index) => {
        if(userList.indexOf(postData.userId) < 0) {
          userList.push(postData.userId)    
        }
        if(!this.service.valid(this.detail[postData.postId])) {
          postRef.child("detail").child(postData.postId).once("value").then(postSnap => {
            var post = postSnap.val()
            
            // check if below line cause error
            if(post.image === undefined) {
              post.image = []
            }
            post.time = new Date(postData.time)
            this.detail[postData.postId] = post
            console.log(index, end)
            // check if below line cause error
            if(index === end) {
              this.service.event.publish("get-user-data", userList)
            }
          })
        }
      })
    }
    else {
      this.service.event.publish("get-user-data", userList)
    }
  }
  // ref error
  pushAPost(userId, content, image) {
    this.service.event.publish("loading")
    var postId = this.ref.child("detail").push().key
    var currTime = Date.now()
    var nodePost = {
      postId: postId,
      time: currTime
    }
    var detailPost = {
      msg: content,
      userId: userId
    }
    if(image.length > 0) {
      detailPost["image"] = image
    }
    console.log(this.list)
    console.log(nodePost)
    this.list.push(nodePost)
    var updateData = {}
    updateData["post/detail/" + postId] = detailPost
    updateData["post/list/" + userId] = this.list
    this.ref.parent.update(updateData).then(() => {
      this.list.push(nodePost)
      detailPost["time"] = new Date(nodePost.time)
      this.detail[postId] = detailPost
      var temp = []
      this.displayNew.forEach((newId, newIndex) => {
        temp[newIndex + 1] = newId
      })
      temp[0] = postId
      this.displayNew = temp
      this.service.event.publish("finish-load")
    })
  }
  changeComment(userId, postId, commentIndex, msg) {
    this.service.event.publish("loading")
    var currTime = Date.now()
    this.ref.child("detail/" + postId).update({msg: msg}).then(() => {
      this.list[postId].comment[commentIndex].msg = msg
      this.service.event.publish("finish-load")
    })
  }
  changePostContent(userId, postId, content, image) {
    this.service.event.publish("loading")
    if(image === undefined) {
      image = []
    }
    var currTime = Date.now()
    var detailPost = {
      msg: content,
      image: image,
      modTIme: currTime
    }
    this.ref.child("detail/" + postId).update(detailPost).then(() => {
      this.detail[postId].msg = content
      this.detail[postId].image = image
      this.service.event.publish("finish-load")
    })
  }

  deletePost(userId, postId) {
    this.ref.child("detail/" + postId).remove().then(() => {
      var list = this.list.filter(postList => {
        return postList.postId !== postId
      })
      this.ref.child("list/" + userId).set(list).then(() => {
        if(this.displayNew.indexOf(postId) >= 0) {
          this.displayNew = this.displayNew.filter(postIdList => {
            return postIdList !== postId 
          })
        }
        if(this.list.indexOf(postId) >= 0) {
          this.list = this.list.filter(postListData => {
            return postListData.postId !== postId 
          })
        }
        this.detail[postId] = null
        this.service.event.publish("finish-load")  
      })
    })
  }
  
  like(userId, postId, like) {
    this.service.event.publish('loading')
    if(like === undefined) {
      like = []
    }
    like.push(userId)
    this.ref.child("detail/" + postId + "/like").set(like).then(() => {
      this.detail[postId].like = like
      this.service.event.publish('finish-load')
    })
  }

  unlike(userId, postId, like) {
    this.service.event.publish('loading')
    like = like.filter(likedUser => {
      return likedUser !== userId
    })
    this.ref.child("detail/" + postId + "/like").set(like).then(() => {
      this.detail[postId].like = like
      this.service.event.publish('finish-load')
    })
  }
  
  likeComment(userId, postId, commentIndex, like) {
    console.log(userId, postId, commentIndex, like)
    this.service.event.publish('loading')
    if(like === undefined) {
      like = []
    }
    like.push(userId)
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/like").set(like).then(() => {
      this.detail[postId].comment[commentIndex].like = like
      this.service.event.publish('finish-load')
    })
  }

  unlikeComment(userId, postId, commentIndex, like) {
    this.service.event.publish('loading')
    like = like.filter(likedUser => {
      return likedUser !== userId
    })
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/like").set(like).then(() => {
      this.detail[postId].comment[commentIndex].like = like
      this.service.event.publish('finish-load')
    })
  }
  
  likeSubcomment(userId, postId, commentIndex, subcommentIndex, like) {
    this.service.event.publish('loading')
    if(like === undefined) {
      like = []
    }
    like.push(userId)
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/comment/" +
        subcommentIndex + "/like").set(like).then(() => {
          this.detail[postId].comment[commentIndex].comment[subcommentIndex].like = like
          this.service.event.publish('finish-load')
        })
  }

  unlikeSubcomment(userId, postId, commentIndex, subcommentIndex, like) {
    this.service.event.publish('loading')
    like = like.filter(likedUser => {
      return likedUser !== userId
    })
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/comment/" +
        subcommentIndex + "/like").set(like).then(() => {
          this.detail[postId].comment[commentIndex].comment[subcommentIndex].like = like
          this.service.event.publish('finish-load')
        })
  }

  comment(userId, postId, comment, msg) {
    this.service.event.publish('loading')
    var currTime = Date.now()
    console.log(userId, postId, comment, msg)
    var commentData
    commentData = {
      userId: userId,
      msg: msg,
      time: currTime
    }
    
    console.log(commentData)
    // realtime issue
    this.ref.child("detail/" + postId + "/comment/" + comment.length).set(commentData).then(() => {
      commentData.time = new Date(currTime)
      this.detail[postId].comment.push(commentData)
      
      this.service.event.publish('finish-load')

    })
  }

  delComment(postId, commentIndex) {
    this.service.event.publish('loading')
    var comment = this.list[postId].comment
    comment = comment.filter((commentData, index) => {
      return commentIndex !== index
    })
    // realtime issue
    this.ref.child("detail/" + postId + "/comment").update(comment).then(() => {
          this.detail[postId].comment = comment
          this.service.event.publish('finish-load')
        })
  }

  subcomment(userId, postId, subcomment, commentIndex, msg) {
    this.service.event.publish('loading')
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
          this.service.event.publish('finish-load')
        })
  }

  delSubcomment(postId, subcomment, commentIndex, subcommentIndex) {
    this.service.event.publish('loading')
    subcomment = subcomment.filter((subcommentData, index) => {
      return subcommentIndex !== index
    })
    // realtime issue
    this.ref.child("detail/" + postId + "/comment/" + commentIndex + "/comment")
        .update(subcomment).then(() => {
          this.detail[postId].comment[commentIndex].subcomment = subcomment
          this.service.event.publish('finish-load')
        })
  }
}
