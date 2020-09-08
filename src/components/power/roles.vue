<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="adddialogVisible=true">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="rolelist" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',index1===0?'bdtop':'','vcenter']"
              v-for="(item1,index1) in scope.row.children"
              :key="index1"
            >
              <el-col :span="5">
                <el-tag closable @close="removerightbyid(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <el-col :span="19">
                <el-row
                  :class="[index2===0?'':'bdtop','vcenter']"
                  v-for="(item2,index2) in item1.children"
                  :key="index2"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removerightbyid(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3,index3) in item2.children"
                      :key="index3"
                      closable
                      @close="removerightbyid(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>

            <!-- <pre>
              {{scope.row}}
            </pre>-->
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="330px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showeditdialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeuserbyid(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showsetrightdialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加用户" :visible.sync="adddialogVisible" width="50%" @close="adddialogclosed">
      <span>
        <el-form :model="addform" :rules="addformrules" ref="addformref" label-width="70px">
          <el-form-item label="角色名" prop="roleName">
            <el-input v-model="addform.roleName"></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="roleDesc">
            <el-input v-model="addform.roleDesc"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="adduser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editdialogVisible" width="50%" @close="editdialogclose">
      <el-form :model="editform" :rules="editformrules" ref="editformref" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editform.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="editform.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edituserinfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setrightdialogVisible"
      width="50%"
      @close="setrightdialogclose"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treetProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defkeys"
        ref="treeref"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setrightdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotright">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      adddialogVisible: false,
      editdialogVisible: false,
      //展示分配权限对话框的显示
      setrightdialogVisible: false,
      rolelist: [],
      addform: {
        roleName: "",
        roleDesc: "",
      },
      addformrules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入用户描述", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      editform: {},
      editformrules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
      },
      rightslist: [],
      treetProps: {
        label: "authName",
        children: "children",
      },
      defkeys: [],
      roleId: '',
    };
  },
  created() {
    this.getrolelist();
  },
  methods: {
    async getrolelist() {
      const { data: res } = await this.$http.get("/roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败！");
      }
      this.rolelist = res.data;

      //console.log(this.rolelist);
    },
    // 添加用户
    adduser() {
      this.$refs.addformref.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addform);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败！");
        }
        this.$message.success("添加用户成功！");
        this.adddialogVisible = false;
        this.getrolelist();
      });
    },
    //关闭添加对话框
    adddialogclosed() {
      this.$refs.addformref.resetFields();
    },
    //删除用户
    async removeuserbyid(id) {
      const result = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => {
        return err;
      });

      if (result !== "confirm") {
        return this.$message.info("已取消删除");
      }

      const { data: res } = await this.$http.delete("roles/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("删除角色失败！");
      }

      this.$message.success("删除角色成功！");
      this.getrolelist();
    },
    // 查询用户
    async showeditdialog(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色信息失败！");
      }
      this.editform = res.data;
      //console.log(this.editform)
      this.editdialogVisible = true;
    },
    //关闭修改用户对话框
    editdialogclose() {
      this.$refs.editformref.resetFields();
    },
    //提交修改信息
    edituserinfo() {
      this.$refs.editformref.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.editform.roleId,
          {
            roleName: this.editform.roleName,
            roleDesc: this.editform.roleDesc,
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("更新角色信息失败！");
        }

        this.editdialogVisible = false;
        this.getrolelist();
        this.$message.success("更新角色信息成功！");
      });
    },
    //删除权限
    async removerightbyid(role, rightid) {
      const result = await this.$confirm(
        "此操作将永久删除该权限 , 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => {
        return err;
      });

      if (result !== "confirm") {
        return this.$message.info("已取消删除");
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightid}`
      );

      console.log(role.id, rightid);
      console.log(res.meta.status);
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败！");
      }
      this.$message.success("删除权限成功！");
      role.children = res.data;
    },
    // 展示分配权限的对话框
    async showsetrightdialog(role) {
      this.roleId = role.id;
      const { data: res } = await this.$http.get("rights/tree");

      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败！");
      }
      this.rightslist = res.data;
      console.log(this.rightslist);
      this.getleafkeys(role, this.defkeys);
      this.setrightdialogVisible = true;
    },
    //获取权限id并保存到defkeys
    getleafkeys(node, arr) {
      //当前节点不包含children，就是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => this.getleafkeys(item, arr));
    },
    setrightdialogclose() {
      this.defkeys = [];
    },
    //为角色分配权限
    async allotright() {
      
      const keys = [
        ...this.$refs.treeref.getCheckedKeys(),
        ...this.$refs.treeref.getHalfCheckedKeys(),
      ]
       
      const idstr = keys.join(",");
      //console.log(idstr)
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idstr }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("分配权限失败！");
      }

      this.$message.success("分配权限成功！");
      this.getrolelist();
      this.setrightdialogVisible = false;
    },
  },
};
</script>

<style lang="less" scoped>
</style>